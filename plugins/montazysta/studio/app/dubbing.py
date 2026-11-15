"""PL -> EN dubbing of the microphone track: ElevenLabs Scribe (speech to text with word timings),
OpenAI (timing-aware translation), ElevenLabs TTS, then per-segment tempo fitting. No Qt here."""
import hashlib,json,os,pathlib,re,subprocess,time,urllib.error,urllib.request,uuid
from project import ROOT,FFMPEG,NO_WINDOW,PROJECTS,audio_indexes,media_cache

SECRETS=ROOT/'app/secrets.json'
ELEVEN='https://api.elevenlabs.io'
TTS_MODELS=[('eleven_v3','Eleven v3 – najwięcej emocji'),('eleven_multilingual_v2','Multilingual v2 – stabilny'),('eleven_flash_v2_5','Flash v2.5 – szybki i tańszy')]
V3_TAGS=['[excited]','[laughs]','[scared]','[whispers]','[shouts]','[sighs]','[surprised]','[angry]']
CHARS_PER_SECOND=15.0   # comfortable spoken English rate used as the translation length budget
MAX_SPEEDUP=1.3

class DubError(RuntimeError):pass

def secrets():
    try:return json.loads(SECRETS.read_text('utf-8-sig'))
    except (OSError,ValueError):return {}
def save_secret(key,value):
    data=secrets();data[key]=value.strip() if isinstance(value,str) else value;SECRETS.write_text(json.dumps(data,indent=2),'utf-8')

# Głosy zakazane przez użytkownika (poziom KRYTYCZNY w tools/kontrola/montaz_progi.json -> zakazane_glosy): twarda blokada
# każdego wywołania ElevenLabs z takim voice_id (text-to-speech, speech-to-speech), żeby żaden skrypt ich nie użył (2026-11-12).
ZAKAZ_GLOSOW=ROOT/'tools/kontrola/montaz_progi.json'
def _zakazany_glos(path):
    try:zg=json.loads(ZAKAZ_GLOSOW.read_text('utf-8')).get('zakazane_glosy',{})
    except (OSError,ValueError):return None
    for vid,o in zg.items():
        if vid.startswith('_') or not isinstance(o,dict) or o.get('poziom')!='KRYTYCZNY':continue
        if vid in path:return vid,o.get('opis','')
    return None

# ------------------------------------------------------------------ ElevenLabs (plain HTTP: no official Python SDK is bundled)
class ElevenLabs:
    def __init__(self,key):
        if not key:raise DubError('Brak klucza ElevenLabs.')
        self.key=key
    def request(self,method,path,body=None,headers=None,timeout=120,tries=4):
        """ElevenLabs answers 429 when it is busy: wait and try again instead of losing the whole job"""
        zakaz=_zakazany_glos(path)
        if zakaz:raise DubError(f'ZAKAZANY GŁOS {zakaz[0]}: {zakaz[1]}. Użyj głosu marki P2 (s5sTcgy9qKwgPPyiFwVJ) albo innego spoza tools/kontrola/montaz_progi.json -> zakazane_glosy.')
        for attempt in range(tries):
            req=urllib.request.Request(ELEVEN+path,data=body,method=method,headers={'xi-api-key':self.key,**(headers or {})})
            try:
                with urllib.request.urlopen(req,timeout=timeout) as r:return r.read(),r.headers.get('content-type','')
            except urllib.error.HTTPError as e:
                detail=e.read().decode('utf-8','replace')
                try:detail=json.loads(detail).get('detail',detail)
                except ValueError:pass
                if isinstance(detail,dict):detail=detail.get('message') or json.dumps(detail,ensure_ascii=False)
                if e.code in (429,500,502,503,504) and attempt+1<tries:time.sleep(4*(attempt+1));continue
                raise DubError(f'ElevenLabs {e.code}: {str(detail)[:300]}') from None
            except urllib.error.URLError as e:
                if attempt+1<tries:time.sleep(4*(attempt+1));continue
                raise DubError(f'Brak połączenia z ElevenLabs: {e.reason}') from None
    def json(self,method,path,payload=None,timeout=120):
        body=json.dumps(payload).encode() if payload is not None else None
        data,_=self.request(method,path,body,{'Content-Type':'application/json'} if body else None,timeout);return json.loads(data)
    def subscription(self):return self.json('GET','/v1/user/subscription')
    def voices(self):
        out=[];token=None
        while True:
            d=self.json('GET','/v2/voices?page_size=100'+(f'&next_page_token={token}' if token else ''))
            out+=d.get('voices',[]);token=d.get('next_page_token')
            if not d.get('has_more') or not token:return out
    def speech_to_text(self,audio_path,language='pol',diarize=False):
        path=pathlib.Path(audio_path);boundary=uuid.uuid4().hex;last=None
        for model in ('scribe_v2','scribe_v1'):
            fields={'model_id':model,'language_code':language,'timestamps_granularity':'word','tag_audio_events':'true','diarize':'true' if diarize else 'false'}
            parts=[f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode() for k,v in fields.items()]
            parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="{path.name}"\r\nContent-Type: {"audio/wav" if path.suffix.lower()==".wav" else "audio/mpeg"}\r\n\r\n'.encode()+path.read_bytes()+b'\r\n')
            body=b''.join(parts)+f'--{boundary}--\r\n'.encode()
            try:data,_=self.request('POST','/v1/speech-to-text',body,{'Content-Type':f'multipart/form-data; boundary={boundary}'},timeout=1800);return json.loads(data)
            except DubError as e:
                last=e
                if 'model' not in str(e).lower():raise
        raise last
    def tts(self,voice_id,text,model):
        stability=0.5 if model=='eleven_v3' else 0.45  # v3 only accepts 0.0 / 0.5 / 1.0
        payload={'text':text,'model_id':model,'voice_settings':{'stability':stability,'similarity_boost':0.75}}
        data,ctype=self.request('POST',f'/v1/text-to-speech/{voice_id}?output_format=mp3_44100_128',json.dumps(payload).encode(),{'Content-Type':'application/json','Accept':'audio/mpeg'},timeout=180)
        if 'audio' not in ctype:raise DubError('ElevenLabs nie zwrócił dźwięku.')
        return data
    def sound_effect(self,text,duration_seconds,loop=False):
        payload={'text':text,'duration_seconds':max(.5,min(30.0,float(duration_seconds))),'prompt_influence':.35,'loop':bool(loop),'model_id':'eleven_text_to_sound_v2'}
        data,ctype=self.request('POST','/v1/sound-generation?output_format=mp3_44100_128',json.dumps(payload).encode(),{'Content-Type':'application/json','Accept':'audio/mpeg'},timeout=300)
        if 'audio' not in ctype:raise DubError('ElevenLabs nie zwrócił efektu dźwiękowego.')
        return data
    def music(self,prompt,duration_seconds,instrumental=True):
        payload={'prompt':prompt,'music_length_ms':max(3000,min(600000,round(float(duration_seconds)*1000))),'model_id':'music_v2_5','force_instrumental':bool(instrumental)}
        data,ctype=self.request('POST','/v1/music/stream?output_format=mp3_48000_192',json.dumps(payload).encode(),{'Content-Type':'application/json','Accept':'audio/mpeg'},timeout=1800)
        if 'audio' not in ctype and 'mpeg' not in ctype:raise DubError('ElevenLabs nie zwrócił muzyki.')
        return data

# ------------------------------------------------------------------ segmentation
def segment_words(words,max_gap=.6,max_len=12.0):
    """group Scribe words into spoken utterances; audio events like (laughs) are kept as hints"""
    segs=[];cur=None
    for w in words:
        kind=w.get('type','word')
        if kind=='spacing':continue
        text=w.get('text','').strip()
        if not text:continue
        start=float(w.get('start',0));end=float(w.get('end',start))
        if cur and (start-cur['end']>max_gap or end-cur['start']>max_len or (re.search(r'[.!?]$',cur['pl']) and cur['end']-cur['start']>1.5)):
            segs.append(cur);cur=None
        if kind=='audio_event':
            if cur:cur['events'].append(text)
            else:segs.append({'start':start,'end':end,'pl':'','events':[text]})
            continue
        if cur is None:cur={'start':start,'end':end,'pl':text,'events':[]}
        else:cur['pl']+=' '+text;cur['end']=end
    if cur:segs.append(cur)
    # a segment that is only a hesitation ("Yy,", "Mm,") has nothing to dub and would sit in the list as an empty line
    out=[s for s in segs if re.search(r'[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]{3}',s['pl'])]
    for i,s in enumerate(out):s['id']=i;s['next_start']=out[i+1]['start'] if i+1<len(out) else None
    return out

def budget(seg):
    """characters the English line may use: its own duration plus part of the silence after it"""
    slot=seg['end']-seg['start']
    if seg.get('next_start') is not None:slot=max(slot,min(seg['next_start']-seg['start']-.1,slot*1.5))
    return max(12,int(slot*CHARS_PER_SECOND))

# ------------------------------------------------------------------ OpenAI translation (Responses API over plain HTTP)
OPENAI='https://api.openai.com/v1/responses'
TRANSLATION_MODELS=[('gpt-6-astra','GPT-6 Astra – najwierniejszy (domyślny)'),('gpt-5.5','GPT-5.5 – luźniejszy slang'),('gpt-5.4','GPT-5.4 – najszybszy')]
DEFAULT_TRANSLATION_MODEL='gpt-6-astra'

INSTRUCTIONS="""You are a professional dubbing adapter for YouTube gaming videos. You turn the spoken Polish commentary of a Minecraft YouTuber into English lines that an English text-to-speech voice will perform over the original gameplay.

GOAL
The English version must sound like a native English-speaking gaming creator recorded it: natural, energetic, funny when the original is funny, scared when the original is scared. A viewer must never feel it is a translation.

HARD RULES
1. Timing: every segment has max_chars. The English line MUST NOT exceed it (emotion tags excluded). The line is spoken in the same time slot as the Polish one, so shorter is better than longer. Cut filler words first, never the point.
2. One segment in, one segment out: return every id exactly once. If a Polish sentence continues across several segments, split the English so each segment says its own part at the same moment.
3. Meaning: keep what was actually said - facts, items, numbers, names, jokes, reactions. Never invent content, never explain, never add commentary.
4. Intensity: match the emotional intensity and swearing level. Mild Polish swearing ("kurde", "o matko") -> mild English ("dang", "oh my god"); strong ("kurwa", "spierdalam") -> equally strong natural English ("holy shit", "what the hell", "I'm outta here"). No slurs.
5. Adapt, do not translate word for word: Polish idioms and slang become the English phrase a gamer would really say ("szacun" -> "props", "jedziemy z tym koksem" -> "let's go", "ziomki" -> "guys", "elegancko" -> "nice"/"sweet", "co ja odwalam" -> "what am I doing").
6. Minecraft vocabulary uses the official English game names (Creeper, Enderman, Nether, Redstone, crafting table, Totem of Undying, Elytra...). Player names, server names and channel names stay unchanged.
7. The transcript comes from automatic speech recognition and can contain misheard words. Use the surrounding lines to recover the intended meaning. Pure filler ("yyy", "eee", "no", "dobra" said alone as a hesitation) becomes a very short natural English filler or an empty string.
8. Write for the ear: contractions (I'm, don't, let's), short sentences, exclamation where the speaker is excited. Numbers as words when spoken naturally. No emojis, no hashtags, no quotation marks around lines, no stage directions in brackets except the allowed emotion tags."""

def translation_schema():
    return {'type':'object','properties':{'segments':{'type':'array','items':{'type':'object',
            'properties':{'id':{'type':'integer'},'en':{'type':'string'}},'required':['id','en'],'additionalProperties':False}}},
            'required':['segments'],'additionalProperties':False}

def openai_json(key,model,prompt,instructions=INSTRUCTIONS):
    data=openai_structured(key,model,instructions,prompt,translation_schema(),'dub_lines')
    return {s['id']:s['en'] for s in data['segments']}

def openai_structured(key,model,instructions,prompt,schema,name,effort='high'):
    """one Responses API call whose answer must follow a JSON schema -> the parsed answer"""
    body={'model':model,'input':[{'role':'developer','content':instructions},{'role':'user','content':prompt}],
          'reasoning':{'effort':effort},'text':{'format':{'type':'json_schema','name':name,'schema':schema,'strict':True}}}
    req=urllib.request.Request(OPENAI,data=json.dumps(body).encode(),headers={'Authorization':f'Bearer {key}','Content-Type':'application/json'})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req,timeout=900) as r:data=json.load(r);break
        except urllib.error.HTTPError as e:
            detail=e.read().decode('utf-8','replace')
            try:detail=json.loads(detail)['error']['message']
            except (ValueError,KeyError,TypeError):pass
            if e.code in (429,500,502,503) and attempt<3:time.sleep(5*(attempt+1));continue
            if e.code==401:raise DubError('Nieprawidłowy klucz OpenAI API.') from None
            if e.code==429:raise DubError('Limit OpenAI API lub brak środków na koncie: '+str(detail)[:200]) from None
            raise DubError(f'OpenAI API {e.code}: {str(detail)[:300]}') from None
        except urllib.error.URLError as e:
            if attempt<3:time.sleep(5);continue
            raise DubError(f'Brak połączenia z OpenAI: {e.reason}') from None
    if data.get('status')=='incomplete':raise DubError('Odpowiedź OpenAI została ucięta ('+str((data.get('incomplete_details') or {}).get('reason'))+').')
    parts=[c for o in data.get('output',[]) if o.get('type')=='message' for c in o.get('content',[])]
    if any(c.get('type')=='refusal' for c in parts):raise DubError('Model odmówił wykonania tego zadania dla tego fragmentu.')
    text=''.join(c.get('text','') for c in parts if c.get('type')=='output_text')
    return json.loads(text)

def tag_rules(tts_model):
    if tts_model=='eleven_v3':
        return (f"EMOTION TAGS: the voice understands tags. When the emotion is clear, start the line with ONE of {' '.join(V3_TAGS)}. "
                "Use them where a real creator would audibly react (screams, laughter, shock), not on calm lines - roughly one line in five at most. "
                "A 'sounds' field lists sounds heard in that segment (e.g. laughter) and is a strong hint for a tag.")
    return 'EMOTION TAGS: not supported by this voice model - never output anything in square brackets.'

def translate(key,segments,tts_model,progress=None,model=DEFAULT_TRANSLATION_MODEL,chunk=120):
    if not key:raise DubError('Wklej klucz OpenAI API w zakładce Dubbing.')
    # the whole Polish transcript goes with every chunk so names, running jokes and tone stay consistent
    overview='\n'.join(f"[{s['id']}] {s['pl']}" for s in segments)
    if len(overview)>60000:overview=overview[:60000]+'\n[...]'
    result={}
    for n in range(0,len(segments),chunk):
        part=segments[n:n+chunk]
        lines=[{'id':s['id'],'pl':s['pl'],'seconds':round(s['end']-s['start'],2),'max_chars':budget(s),**({'sounds':s['events']} if s.get('events') else {})} for s in part]
        done=[{'id':s['id'],'en':result[s['id']]} for s in segments[max(0,n-10):n] if s['id'] in result]
        prompt=(tag_rules(tts_model)+"\n\nFULL POLISH TRANSCRIPT OF THE VIDEO (context only):\n"+overview
                +("\n\nYOUR PREVIOUS ENGLISH LINES JUST BEFORE THIS PART (keep the same voice, do not return them):\n"+json.dumps(done,ensure_ascii=False) if done else '')
                +f"\n\nTRANSLATE THESE {len(lines)} SEGMENTS (return all ids, respect max_chars):\n"+json.dumps(lines,ensure_ascii=False))
        out=openai_json(key,model,prompt);missing=[s['id'] for s in part if s['id'] not in out]
        if missing:raise DubError(f'Model pominął {len(missing)} kwestii – spróbuj ponownie.')
        result.update(out)
        if progress:progress(min(n+chunk,len(segments)),len(segments))
    return result

def shorten(key,segments,tts_model,model=DEFAULT_TRANSLATION_MODEL):
    """second pass for lines whose voiced audio was too long even after speeding up"""
    if not segments:return {}
    lines=[{'id':s['id'],'pl':s.get('pl') or '(extra storytelling line, no Polish original)','current_en':s['en'],'max_chars':max(8,int(budget(s)*.75))} for s in segments]
    return openai_json(key,model,tag_rules(tts_model)+"\n\nThese English lines were voiced too long for their time slots. Rewrite each one shorter so it fits max_chars, "
                       "keeping the meaning, the punchline and the emotion (keep its emotion tag if it had one).\n"+json.dumps(lines,ensure_ascii=False))

# ------------------------------------------------------------------ optional storytelling filler: extra lines written into the silence
STORY_MODES=[('light','Delikatnie – tylko długie ciszy'),('medium','Średnio – naturalne dogadywanie'),('heavy','Mocno – prawie bez ciszy')]
DEFAULT_STORY_MODE='medium'
STORY_PARAMS={'light':{'min_gap':3.4,'hook_gap':2.2,'per_minute':2},'medium':{'min_gap':2.2,'hook_gap':1.5,'per_minute':4},'heavy':{'min_gap':1.5,'hook_gap':1.1,'per_minute':7}}
STORY_CHARS=.82       # a filler stays clearly inside its gap: a breath at both ends is what makes it sound spoken, not squeezed in
STORY_CHUNK=7.0       # one gap longer than this is filled with more than one line instead of a monologue
STORY_SPEEDUP=1.15    # an invented line is never worth rushing as hard as a real one
HOOK_SECONDS=45.0     # the opening of the finished video gets the densest treatment

STORY_INSTRUCTIONS="""You are the co-writer of a Minecraft YouTube creator's commentary. He already recorded his own voice: he mostly says what he sees, where he is and what he is doing, with long silent stretches in between. Your job is to write the EXTRA English lines that go INTO THOSE SILENCES, in his voice, so the video feels alive and addictive from the first second.

WHO IS SPEAKING
You write as him: first person, present tense, same energy and humour as his own lines. Never a documentary narrator, never third person, never "our hero". A viewer must believe he said every word himself.

WHAT YOU MAY SAY (you cannot see the video - you only have the transcript)
- His feelings and reactions: nerves, excitement, disbelief, being fed up.
- His intentions and plan: what he is about to do, why, what he needs first.
- The stakes: what he loses if it goes wrong, what he gets if it works.
- Curiosity and questions to the viewer ("guess what I found down there", "tell me this is a bad idea").
- Callbacks to something he already said earlier in the transcript, and light foreshadowing of what he says later.
- Small self-aware jokes about his own decisions.

WHAT YOU MUST NEVER DO
1. Never invent anything visual or factual that the transcript does not support: no new mobs, items, numbers, biomes, structures, deaths, player names or events. If you would have to guess what is on screen, write about intention or feeling instead - or return an empty string.
2. Never repeat, summarise or paraphrase what he says right before or right after the gap. Add, do not echo.
3. Never contradict a later line. You can see the whole video: use it so the lines feel planned, but do not spoil the punchline before he gets there.
4. No channel cliches: no "welcome back", "in today's video", "don't forget to subscribe", "hit that like button", no intro or outro talk, no sponsor talk.
5. No stage directions, no emojis, no hashtags, no quotation marks, no asterisks - only the spoken words (plus an allowed emotion tag).
6. No slurs. Swearing only at the level he already uses himself.

TIMING
Every gap has max_chars for the words it can hold and gap_seconds of real silence. The line MUST fit max_chars - shorter is always better, silence around a line is good. One or two short sentences, spoken English: contractions, short words, no clauses stacked up.

WHEN TO STAY SILENT
Return an empty string for a gap when nothing you could add would be better than silence: right after a punchline, in the middle of an action beat where the game should be heard, or when you would only be padding. A few strong lines beat a wall of talk. Aim to fill roughly two thirds of the offered gaps, and leave the rest empty.

THE OPENING ("opening hook")
Gaps marked as the opening hook are the first seconds of the finished video and decide whether anyone stays. Here you are allowed to be the most dynamic: state what he is going into, what could go wrong, what the goal is, in a way that makes stopping impossible. Still no invented facts - build it out of what the transcript already tells you he is doing, and out of stakes and attitude."""

def merge_ranges(ranges):
    """the stretches of a recording that are actually used on the timeline, glued together and in order"""
    out=[]
    for a,b in sorted((float(a),float(b)) for a,b in ranges if float(b)-float(a)>.05):
        if out and a<=out[-1][1]+.05:out[-1][1]=max(out[-1][1],b)
        else:out.append([a,b])
    return [(a,b) for a,b in out]

def spoken_end(seg):
    """where a line really stops: its voiced length once it has one, its Polish slot before that"""
    return seg['start']+(seg['dur'] if seg.get('dur') else max(0.0,seg.get('end',seg['start'])-seg['start']))

def story_gaps(segments,ranges,mode=DEFAULT_STORY_MODE,hook=True,hook_seconds=HOOK_SECONDS):
    """silent stretches worth a filler line, in source time of the recording; long ones are split into several slots.
    Only the parts of the recording that are on the timeline are offered, so nothing is written (or paid for) for cut-away material."""
    par=STORY_PARAMS.get(mode,STORY_PARAMS[DEFAULT_STORY_MODE]);ranges=merge_ranges(ranges)
    if not ranges:return []
    spans=sorted((s['start'],spoken_end(s)) for s in segments if (s.get('en','') or s.get('pl','')).strip())
    free=[];offset=0.0
    for lo,hi in ranges:
        t=lo
        for a,b in spans:
            if b<=lo or a>=hi:continue
            if a-t>.05:free.append((t,min(a,hi),offset+t-lo))
            t=max(t,b)
        if hi-t>.05:free.append((t,hi,offset+t-lo))
        offset+=hi-lo
    out=[]
    for a,b,pos in free:
        a+=.35;b-=.25   # a breath after his own line and before the next one
        span=b-a;need=par['hook_gap'] if bool(hook) and pos<hook_seconds else par['min_gap']
        if span<need:continue
        n=max(1,min(4,int(round(span/STORY_CHUNK))))
        while n>1 and span/n<max(need,2.0):n-=1
        step=span/n
        for k in range(n):
            s=a+k*step;e=s+step-(.25 if n>1 else 0);at=pos+k*step
            out.append({'start':round(s,3),'end':round(e,3),'seconds':round(e-s,2),'pos':round(at,2),'hook':bool(hook) and at<hook_seconds,
                        'max_chars':max(14,int((e-s)*CHARS_PER_SECOND*STORY_CHARS))})
    keep=[];per={}
    for g in sorted(out,key=lambda g:(not g['hook'],-g['seconds'])):   # when a minute has too many gaps, the longest ones win
        k=int(g['pos']//60);cap=par['per_minute']+(3 if k==0 else 0)
        if per.get(k,0)>=cap:continue
        per[k]=per.get(k,0)+1;keep.append(g)
    keep.sort(key=lambda g:g['start'])
    for i,g in enumerate(keep):g['id']=i
    return keep

def story_lines(key,segments,gaps,tts_model,model=DEFAULT_TRANSLATION_MODEL,progress=None,chunk=40):
    """write the extra lines for the offered gaps; an empty answer for a gap means 'leave the silence alone'"""
    if not key:raise DubError('Wklej klucz OpenAI API w zakładce Dubbing.')
    if not gaps:return {}
    order=sorted((s for s in segments if s.get('en','').strip()),key=lambda s:s['start'])
    overview='\n'.join(f"{s['start']:.1f}s  {s['en']}"+(f"   (PL: {s['pl']})" if s.get('pl') else '   (extra line already written by you)') for s in order)
    if len(overview)>60000:overview=overview[:60000]+'\n[...]'
    result={}
    for n in range(0,len(gaps),chunk):
        part=gaps[n:n+chunk];items=[]
        for g in part:
            before=[s['en'] for s in order if s['start']<g['start']][-3:]
            after=[s['en'] for s in order if s['start']>=g['end']][:3]
            items.append({'id':g['id'],'at_second':round(g['start'],1),'gap_seconds':g['seconds'],'max_chars':g['max_chars'],
                          'place':'opening hook' if g['hook'] else 'middle of the video','he_just_said':before,'he_says_next':after})
        prompt=(tag_rules(tts_model)+"\n\nTHE WHOLE VIDEO AS HE RECORDED IT (English dub of his own lines):\n"+overview
                +f"\n\nWRITE THE FILLER LINES FOR THESE {len(items)} SILENT GAPS (return every id; an empty string leaves that gap silent):\n"
                +json.dumps(items,ensure_ascii=False))
        out=openai_json(key,model,prompt,STORY_INSTRUCTIONS);ids={g['id'] for g in part}
        result.update({k:v for k,v in out.items() if k in ids})
        if progress:progress(min(n+chunk,len(gaps)),len(gaps))
    return result

def relink(segments):
    """next_start is what stops a line from running into the next one, so it has to follow every insert and delete"""
    for i,s in enumerate(segments):s['next_start']=segments[i+1]['start'] if i+1<len(segments) else None
    return segments

def merge_story(segments,gaps,lines):
    """put the accepted filler lines into the segment list; his own lines are never touched"""
    base=max([s['id'] for s in segments],default=-1)+1;added=[]
    for g in gaps:
        en=(lines.get(g['id']) or '').strip()
        if not en or not re.sub(r'\[[^\]]*\]','',en).strip():continue
        if len(re.sub(r'\[[^\]]*\]','',en).strip())>g['max_chars']*1.6:continue   # a line that ignored its budget would only get squeezed
        added.append({'id':base+len(added),'start':g['start'],'end':g['end'],'pl':'','events':[],'en':en,'file':None,'story':True})
    return relink(sorted(segments+added,key=lambda s:s['start'])),len(added)

def story_count(segments):return sum(1 for s in segments if s.get('story'))

# ------------------------------------------------------------------ audio helpers
def run(args,check=True):
    p=subprocess.run(args,capture_output=True,creationflags=NO_WINDOW)
    if check and p.returncode:raise DubError('FFmpeg: '+p.stderr.decode('utf-8','replace').strip()[-300:])
    return p

def duration(path):
    p=run([str(FFMPEG).replace('ffmpeg.exe','ffprobe.exe'),'-v','error','-show_entries','format=duration','-of','csv=p=0',str(path)])
    return float(p.stdout.decode().strip() or 0)

def extract_mic(media,target):
    mic,_=audio_indexes(media['info'].get('audio'))
    if mic is None:raise DubError('To nagranie nie ma osobnej ścieżki mikrofonu.')
    if not target.exists():
        tmp=target.with_suffix('.part.mp3')
        run([str(FFMPEG),'-v','error','-y','-i',media['path'],'-map',f'0:a:{mic}','-ac','1','-ar','16000','-b:a','48k',str(tmp)]);os.replace(tmp,target)
    return target

def fit(src,dst,factor):
    """tempo change without pitch change; factor 1.0 just converts"""
    run([str(FFMPEG),'-v','error','-y','-i',str(src),'-af',f'atempo={factor:.3f}' if factor>1.001 else 'anull','-ar','48000','-ac','2',str(dst)])

def slot_of(seg):
    """how long the voiced line may last before it runs into the next utterance"""
    own=seg['end']-seg['start'];gap=(seg['next_start']-seg['start']-.08) if seg.get('next_start') is not None else own+1.5
    return max(own,gap)

# ------------------------------------------------------------------ pipeline
def dub_folder(project,mid):
    d=PROJECTS/'dubbing'/f"{project.path.stem}-{mid}";d.mkdir(parents=True,exist_ok=True);return d

def extract_speech(media,target):
    """microphone track of studio recordings, otherwise the first audio track (reels, client videos).
    Quiet passages are lifted (speech recorded far from the mic was being skipped by the recognizer)."""
    mic,game=audio_indexes(media['info'].get('audio'))
    track=mic if mic is not None else game
    if track is None:raise DubError(f"Plik {pathlib.Path(media['path']).name} nie ma dźwięku.")
    if not target.exists():
        tmp=target.with_suffix('.part.wav')
        run([str(FFMPEG),'-v','error','-y','-i',media['path'],'-map',f'0:a:{track}','-af','highpass=f=70,dynaudnorm=f=200:g=11:p=0.62:m=18',
             '-ac','1','-ar','16000','-c:a','pcm_s16le',str(tmp)]);os.replace(tmp,target)
    return target

def speech_file(media):return media_cache(media['path'])/'mic.wav'

def transcribe(eleven,media,progress=None,language='pol',diarize=False):
    """word timings of a file's speech, cached per file. Polish (own recordings) keeps the old cache name;
    other languages - e.g. English film material cut into reels - get their own, with speakers told apart when asked"""
    cache=media_cache(media['path']);target=cache/('scribe.json' if language=='pol' and not diarize else f'scribe-{language}{"-spk" if diarize else ""}.json')
    if target.exists():return json.loads(target.read_text('utf-8'))
    if progress:progress(f"Wycinam mowę: {pathlib.Path(media['path']).stem}…")
    audio=extract_speech(media,speech_file(media))
    if progress:progress('Rozpoznaję mowę (ElevenLabs Scribe)… przy długim nagraniu to może potrwać kilka minut')
    data=eleven.speech_to_text(audio,language,diarize)
    # an empty result is not cached: it usually means a silent track, and the next attempt should try again for free
    if data.get('words'):target.write_text(json.dumps(data,ensure_ascii=False),'utf-8')
    return data

def mean_volume(path,track=None):
    """average level in dB of a file (or of one of its audio tracks), -99 when it is silent"""
    args=[str(FFMPEG),'-hide_banner','-i',str(path)]+(['-map',f'0:a:{track}'] if track is not None else [])
    p=run(args+['-af','volumedetect','-f','null','-'],check=False)  # volumedetect prints at info level
    m=re.search(r'mean_volume:\s*(-?[\d.]+) dB',(p.stderr or b'').decode('utf-8','ignore'))
    return float(m.group(1)) if m else -99.0

def voice_segment(eleven,seg,voice,model,folder):
    """generate (or reuse) the TTS file for one segment and fit it into its slot; returns overflow seconds"""
    text=seg['en'].strip()
    if not text or not re.sub(r'\[[^\]]*\]','',text).strip():seg.update(file=None,dur=0,speed=1.0);return 0.0
    key=hashlib.sha1(f'{voice}|{model}|{text}'.encode()).hexdigest()[:14];raw=folder/f'raw-{key}.mp3'
    if not raw.exists():raw.write_bytes(eleven.tts(voice,text,model))
    length=duration(raw);slot=slot_of(seg);factor=1.0
    if length>slot:factor=min(STORY_SPEEDUP if seg.get('story') else MAX_SPEEDUP,length/slot)
    out=folder/f'seg-{key}-{int(factor*1000)}.wav'
    if not out.exists():fit(raw,out,factor)
    seg.update(file=str(out),dur=length/factor,speed=round(factor,3));return max(0.0,length/factor-slot)

def chars_needed(segments):return sum(len(re.sub(r'\[[^\]]*\]','',s.get('en','')).strip()) for s in segments)
