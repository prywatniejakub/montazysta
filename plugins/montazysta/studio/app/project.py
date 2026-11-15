"""Montage project v2: main video track of clips from many files, free audio items and program-time effects.
No Qt here; export lives in render.py."""
import csv,json,os,pathlib,re,subprocess,uuid,copy
from array import array
from effects import EFFECTS

ROOT=pathlib.Path(__file__).resolve().parent.parent
FFMPEG=ROOT/'ffmpeg/ffmpeg.exe';FFPROBE=ROOT/'ffmpeg/ffprobe.exe'
PROJECTS=ROOT/'projects';EXPORTS=ROOT/'exports';CACHE=PROJECTS/'cache'
NO_WINDOW=subprocess.CREATE_NO_WINDOW
MIN_CLIP=.1
PEAK_RATE=100  # waveform peaks per second of source
IMAGE_SECONDS=3.0
VIDEO_EXT={'.mkv','.mp4','.mov','.webm','.avi','.m4v','.gif','.flv','.wmv'}
AUDIO_EXT={'.wav','.mp3','.ogg','.m4a','.flac','.aac','.opus','.wma'}
IMAGE_EXT={'.png','.jpg','.jpeg','.webp','.bmp'}

def kind_of(path):
    ext=pathlib.Path(path).suffix.lower()
    return 'video' if ext in VIDEO_EXT else 'audio' if ext in AUDIO_EXT else 'image' if ext in IMAGE_EXT else None

def new_id():return uuid.uuid4().hex[:8]
def safe_name(name):return re.sub(r'[<>:"/\\|?*]','_',str(name)).strip().rstrip('.')

MIN_SPEED,MAX_SPEED=.25,4.0
def speed_of(item):
    """playback rate of a clip or a sound: 1.0 when it was never touched, so old projects need no migration"""
    try:s=float(item.get('speed') or 1.0)
    except (TypeError,ValueError):return 1.0
    return min(MAX_SPEED,max(MIN_SPEED,s)) if s>0 else 1.0

# transitions between two clips of the main track: key -> (label, FFmpeg xfade name). A transition is stored on the clip it
# leads INTO ('trans' on clip i joins clip i-1 and i). It is centred on the cut and eats no time: the outgoing clip plays a bit
# past its out point and the incoming one starts a bit before its in point, so sounds and effects never have to move.
TRANSITIONS={'fade':('Przenikanie','fade'),'dissolve':('Rozpuszczenie','dissolve'),'fadeblack':('Przez czerń','fadeblack'),
             'fadewhite':('Przez biel (błysk)','fadewhite'),'slideleft':('Wsunięcie z prawej','slideleft'),'wipeleft':('Wymazanie','wipeleft'),
             'smoothleft':('Płynne przesunięcie','smoothleft'),'circleopen':('Koło','circleopen'),'zoomin':('Zbliżenie','zoomin'),
             'pixelize':('Pikseloza','pixelize'),'hblur':('Rozmycie','hblur'),'radial':('Zegar','radial'),
             # whip pan: the shot flies out sideways, the next one flies in; the export adds a sideways motion blur on top
             'whipleft':('Whip pan ← (szybki rzut kamerą)','slideleft'),'whipright':('Whip pan → (szybki rzut kamerą)','slideright')}
TRANSITION_LENGTHS=(.25,.5,.75,1.0,1.5,2.0)
DEFAULT_TRANSITION=.5

REELS_ROOT=ROOT/'rolki';REELS_PROJECTS=PROJECTS/'rolki';REELS_EXPORTS=EXPORTS/'rolki'
ASSEMBLY_ROOT=ROOT/'sortownia';ASSEMBLY_MEDIA=ASSEMBLY_ROOT/'materiały';ASSEMBLY_PROJECTS=PROJECTS/'sortownia'
REEL_STATUSES=['do zrobienia','w trakcie','gotowe','wyeksportowane']
# the second pass: a finished edit rendered into ONE file (recordings/złączone), cut again as a whole, plus reels taken from it
FINAL_PROJECTS=PROJECTS/'final';MERGED=ROOT/'recordings'/'złączone'
REEL_FORMATS={'crop':'Przycięcie do środka (pełny ekran)','blur':'Cały kadr + rozmyte tło'}
SPEECH_MIN=6  # mic peak byte (0-255 linear, ~ -33 dBFS) that always counts as speech; a noisy mic raises it
SUGGEST_KINDS=('Short','Dobry moment','Śmieszne','Strach')

def probe(path):
    out=subprocess.run([str(FFPROBE),'-v','error','-print_format','json','-show_format','-show_streams',str(path)],capture_output=True,creationflags=NO_WINDOW)
    if out.returncode:raise RuntimeError(f'Nie można odczytać pliku {pathlib.Path(path).name}: {out.stderr.decode("utf-8","replace").strip()[-300:]}')
    d=json.loads(out.stdout);video=[s for s in d['streams'] if s['codec_type']=='video' and not (s.get('disposition') or {}).get('attached_pic')]
    audio=[(s.get('tags') or {}).get('title','') for s in d['streams'] if s['codec_type']=='audio']
    info={'duration':float(d['format'].get('duration') or 0),'fps':30.0,'width':0,'height':0,'audio':audio,'has_video':bool(video)}
    if video:
        v=video[0];num,den=(v.get('avg_frame_rate') or '30/1').split('/')
        fps=float(num)/float(den) if float(den) else 30.0
        info.update(fps=round(fps,3) if 1<fps<240 else 30.0,width=v.get('width',0),height=v.get('height',0))
    return info

def audio_indexes(titles):
    """(mic, game) audio stream indexes; OBS records Miks/Mikrofon/Gra. Other files: their first track acts as 'game'."""
    if not titles:return None,None
    mic=titles.index('Mikrofon') if 'Mikrofon' in titles else (1 if len(titles)>=3 else None)
    game=titles.index('Gra') if 'Gra' in titles else (2 if len(titles)>=3 else 0)
    return mic,game

def read_markers(path):
    if not path or not pathlib.Path(path).exists():return []
    with open(path,encoding='utf-8-sig',newline='') as f:
        return [{'t':int(r['milliseconds'])/1000,'kind':r['marker'],'note':r.get('note','')} for r in csv.DictReader(f)]

def find_markers_csv(recording):
    for session in (ROOT/'markers').glob('*.json'):
        try:data=json.loads(session.read_text('utf-8'))
        except (OSError,ValueError):continue
        if data.get('recording') and pathlib.Path(data['recording'])==pathlib.Path(recording):return data.get('markers')
    return None

def fmt(t,tenths=False):
    t=max(0,t);h=int(t//3600);m=int(t//60%60);s=t%60
    sec=f'{s:04.1f}' if tenths else f'{int(s):02}'
    return f'{h}:{m:02}:{sec}' if h else f'{m:02}:{sec}'

SEARCH_ROOTS=[ROOT/'recordings',ROOT/'biblioteka',ROOT/'rolki',ROOT/'sortownia',pathlib.Path.home()/'Downloads',pathlib.Path.home()/'Videos',pathlib.Path.home()/'Music']
def find_media(name,size=None):
    """look for a media file that was moved elsewhere; same size wins over a same-named file"""
    best=None
    for root in SEARCH_ROOTS:
        if not root.exists():continue
        try:hits=list(root.rglob(name))
        except OSError:continue
        for hit in hits:
            if not hit.is_file():continue
            if size and hit.stat().st_size==size:return hit
            best=best or hit
    return best

def media_cache(path):
    p=pathlib.Path(path);st=p.stat();d=CACHE/f'{p.stem[:60]}-{st.st_size}';d.mkdir(parents=True,exist_ok=True);return d

class Project:
    def __init__(self,path,data):self.path=pathlib.Path(path);self.data=migrate(data)
    # --- files
    @classmethod
    def load(cls,path):
        data=json.loads(pathlib.Path(path).read_text('utf-8'));media=data.get('media') or {}
        for key in ('main','audio'):  # an item pointing at unknown media would crash every paint of the timeline
            if key in data:data[key]=[x for x in data[key] if x.get('media') in media]
        p=cls(path,data)
        if p.relink_media():p.save()
        return p
    def relink_media(self):
        """a file moved to another folder is found again by name (and size), so the project keeps working"""
        changed=False
        for m in self.media.values():
            old=pathlib.Path(m['path'])
            if old.exists():continue
            found=find_media(old.name,m.get('size'))
            if found:m['path']=str(found);m['size']=found.stat().st_size;changed=True
        return changed
    @classmethod
    def empty(cls,name,folder=None,output=None):
        folder=pathlib.Path(folder or PROJECTS);base=safe_name(name) or 'Projekt';path=folder/f'{base}.json';n=2
        while path.exists():path=folder/f'{base} ({n}).json';n+=1
        data={'version':2,'name':path.stem,'media':{},'main':[],'audio':[],'effects':[],'markers':[],'volumes':{'mic':1.0,'game':1.0}}
        if output:data['output']=output
        p=cls(path,data);p.save();return p
    @classmethod
    def create_reel(cls,source,client):
        """one vertical project per reel file, stored under the client's folder"""
        p=cls.empty(pathlib.Path(source).stem,REELS_PROJECTS/safe_name(client),{'width':1080,'height':1920})
        p.data['kind']='reel';p.data['client']=client;p.data['status']=REEL_STATUSES[0]
        try:mid=p.add_media(source);p.insert_main(0,mid)
        except Exception:p.path.unlink(missing_ok=True);raise
        p.save();return p
    @classmethod
    def open_recording(cls,recording,markers_csv=None):
        recording=pathlib.Path(recording);path=PROJECTS/f'{recording.stem}.json'
        if path.exists():
            p=cls.load(path)
            if any(pathlib.Path(m['path'])==recording for m in p.media.values()):return p
        p=cls(path,{'version':2,'name':recording.stem,'media':{},'main':[],'audio':[],'effects':[],'markers':[],'volumes':{'mic':1.0,'game':1.0}})
        mid=p.add_media(recording,markers_csv);p.insert_main(0,mid);p.save();return p
    def save(self):
        self.path.parent.mkdir(parents=True,exist_ok=True);tmp=self.path.with_suffix('.tmp')
        tmp.write_text(json.dumps(self.data,ensure_ascii=False,indent=1),'utf-8');os.replace(tmp,self.path)
    # --- accessors
    @property
    def name(self):return self.data.get('name') or self.path.stem
    @property
    def media(self):return self.data['media']
    @property
    def main(self):return self.data['main']
    @property
    def audio(self):return self.data['audio']
    @property
    def effects(self):return self.data['effects']
    @property
    def markers(self):return self.data['markers']
    def output(self):
        """the export follows the recording it was cut from, so a 1440p capture is not thrown away at 1080p;
        a project that states its own size (a vertical reel) keeps it"""
        o=self.data.get('output') or {}
        src=next((m['info'] for m in self.media.values() if m['kind']=='video' and m['info'].get('has_video') and m['info'].get('width')),None)
        w=o.get('width') or (src['width'] if src else 1920)
        h=o.get('height') or (src['height'] if src else 1080)
        return w,h,o.get('fps') or (src['fps'] if src else 30.0)
    def add_media(self,path,markers_csv=None):
        path=pathlib.Path(path)
        for mid,m in self.media.items():
            if pathlib.Path(m['path'])==path:return mid
        kind=kind_of(path)
        if not kind:raise RuntimeError(f'Nieobsługiwany typ pliku: {path.name}')
        info=probe(path) if kind!='image' else {'duration':IMAGE_SECONDS,'fps':30.0,'width':0,'height':0,'audio':[],'has_video':True}
        if kind=='image':
            try:size=probe(path);info.update(width=size['width'],height=size['height'])  # a still reframed like video needs its size
            except Exception:pass
        if kind=='video' and not info['has_video']:kind='audio'
        if kind=='audio' and not info['audio']:raise RuntimeError(f'Plik {path.name} nie zawiera dźwięku.')
        mid=new_id();self.media[mid]={'path':str(path),'kind':kind,'info':info,'size':path.stat().st_size}  # size: the file can be found again after a move
        if kind=='video':
            for m in read_markers(markers_csv or find_markers_csv(path)):self.markers.append(dict(m,media=mid))
        return mid
    def media_of(self,item):return self.media[item['media']]
    def label(self,item):
        if item.get('freeze'):return '❄ Stop-klatka'
        stem=pathlib.Path(self.media_of(item)['path']).stem
        return 'Plansza' if stem.startswith('plansza-') else stem
    # --- main track
    def dur(self,c):return (c['out']-c['in'])/speed_of(c)  # seconds on the programme, after the clip's own rate
    def duration(self):return sum(self.dur(c) for c in self.main)
    def clip_start(self,i):return sum(self.dur(c) for c in self.main[:i])
    def locate(self,t):
        """Program time -> (clip index, source time). Index -1 when the main track is empty."""
        acc=0.0
        for i,c in enumerate(self.main):
            d=self.dur(c)
            if t<acc+d or i==len(self.main)-1:return i,c['in']+min(max(t-acc,0.0),d)*speed_of(c)
            acc+=d
        return -1,0.0
    def program_times(self,mid,src):
        out=[];acc=0.0
        for c in self.main:
            if c['media']==mid and c['in']<=src<c['out']:out.append(acc+(src-c['in'])/speed_of(c))
            acc+=self.dur(c)
        return out
    def set_speed(self,i,value):
        """change one clip's rate; everything after it slides so the picture stays glued together"""
        c=self.main[i];before=self.dur(c);c['speed']=round(min(MAX_SPEED,max(MIN_SPEED,float(value))),3)
        after=self.dur(c);self.ripple(self.clip_start(i)+min(before,after),after-before);return c['speed']
    def boundary_index(self,t):
        """index of the clip boundary nearest to program time t"""
        acc=0.0;best=(abs(t),0)
        for i,c in enumerate(self.main):
            acc+=self.dur(c);best=min(best,(abs(t-acc),i+1))
        return best[1]
    # --- transitions between clips
    def set_transition(self,i,kind,duration=None):
        """kind None removes it; i is the clip the transition leads into (1..len-1)"""
        if not 0<i<len(self.main):return False
        c=self.main[i]
        if kind is None:return c.pop('trans',None) is not None
        if kind not in TRANSITIONS:raise ValueError(f'Nieznane przejście: {kind}')
        old=c.get('trans') or {}
        c['trans']={'type':kind,'duration':round(float(duration or old.get('duration') or DEFAULT_TRANSITION),3)};return True
    def transition(self,i):
        """(kind, seconds) really used at the cut before clip i: clamped so both neighbours can carry it. None: a plain cut"""
        if not 0<i<len(self.main):return None
        t=self.main[i].get('trans')
        if not t or t.get('type') not in TRANSITIONS:return None
        d=min(float(t.get('duration') or DEFAULT_TRANSITION),.9*self.dur(self.main[i-1]),.9*self.dur(self.main[i]))
        return (t['type'],round(d,3)) if d>=MIN_CLIP else None
    def transitions(self):
        """[(program time of the cut, kind, seconds)]"""
        out=[];acc=0.0
        for i,c in enumerate(self.main):
            if i and (tr:=self.transition(i)):out.append((acc,*tr))
            acc+=self.dur(c)
        return out
    def split(self,t):
        i,src=self.locate(t)
        if i<0:return False
        c=self.main[i]
        if src-c['in']<MIN_CLIP or c['out']-src<MIN_CLIP:return False
        # deep copies: both halves keep the whole volume curve (in source time) without sharing one list
        second=dict(copy.deepcopy(c),id=new_id(),**{'in':src});second.pop('trans',None);second.pop('jcut',None)  # the transition / J-cut stays on the cut it was made for
        self.main[i:i+1]=[dict(copy.deepcopy(c),out=src),second];return True
    def insert_main(self,index,mid,start=None,end=None):
        m=self.media[mid]
        if m['kind']=='audio':raise RuntimeError('Dźwięk wstaw na ścieżkę dźwięków, nie na wideo.')
        clip={'id':new_id(),'media':mid,'in':0.0 if start is None else start,'out':m['info']['duration'] if end is None else end,'gain':1.0,'muted':False,'fit':'contain'}
        at=self.clip_start(index);self.main.insert(index,clip);self.ripple(at,self.dur(clip));return clip
    def insert_at(self,t,mid):
        """split at t when it falls inside a clip, then insert there"""
        if self.main and 0<t<self.duration():self.split(t)
        return self.insert_main(self.boundary_index(t),mid)
    def delete_main(self,i):
        if not 0<=i<len(self.main):return False
        at=self.clip_start(i);d=self.dur(self.main[i]);del self.main[i];self.ripple(at,-d);return True
    def move_main(self,i,j):
        """move clip i so it lands before the clip currently at boundary j"""
        if not 0<=i<len(self.main) or j in (i,i+1):return False
        clip=self.main.pop(i);self.main.insert(j-1 if j>i else j,clip);return True
    def trim_main(self,i,edge,value):
        c=self.main[i];before=self.dur(c);limit=self.media_of(c)['info']['duration']
        if self.media_of(c)['kind']=='image':limit=max(limit,3600.0)
        if edge=='in':c['in']=min(max(0.0,value),c['out']-MIN_CLIP)
        else:c['out']=max(min(limit,value),c['in']+MIN_CLIP)
        after=self.dur(c);start=self.clip_start(i)
        # out edge: time is removed/added at the clip's end; in edge: at its start, so items on the clip follow its content
        self.ripple(start if edge=='in' else start+min(before,after),after-before)
    def ripple(self,at,delta):
        """keep sounds/effects/dub lines glued to the picture after an insert (delta>0) or removal (delta<0) at program time 'at'"""
        if not delta:return
        for item in self.audio+self.effects+self.dubtrack+self.reels:
            if delta>0 and item['start']>=at-1e-6:item['start']+=delta
            elif delta<0:
                if item['start']>=at-delta-1e-6:item['start']+=delta
                elif item['start']>at:item['start']=at
    # --- audio items and effects
    def add_audio(self,mid,start):
        m=self.media[mid]
        if not m['info']['audio']:raise RuntimeError('Ten plik nie ma dźwięku.')
        item={'id':new_id(),'media':mid,'start':max(0.0,start),'in':0.0,'out':m['info']['duration'],'gain':1.0,'fade_in':0.0,'fade_out':0.0}
        self.audio.append(item);return item
    def add_effect(self,kind,start,**params):
        spec=EFFECTS[kind]
        item={'id':new_id(),'type':kind,'start':max(0.0,start),'duration':spec['duration'],**copy.deepcopy(spec['params']),**params}
        self.effects.append(item);return item
    def audio_end(self,a):return a['start']+(a['out']-a['in'])/speed_of(a)
    def find(self,item_id):
        for name in ('main','audio','effects','dubtrack'):
            for i,item in enumerate(self.data[name]):
                if item['id']==item_id:return name,i,item
        return None,-1,None
    def delete_item(self,item_id):
        name,i,_=self.find(item_id)
        if name=='main':return self.delete_main(i)
        if name:del self.data[name][i];return True
        return False
    # --- dubbing: segments live in source time of a recording, so they follow every cut of its clips,
    #     until the lane is detached - then every line becomes a free block with its own program time
    @property
    def dubs(self):return self.data.setdefault('dubs',{})
    @property
    def dubtrack(self):return self.data.setdefault('dubtrack',[])
    @property
    def dub_detached(self):return self.data.setdefault('dub_detached',[])
    def dub_active(self):return self.data.get('use_dub',True)
    def use_dub(self,mid):return self.dub_active() and any(s.get('file') for s in self.dubs.get(mid,{}).get('segments',[]))
    def detached(self,mid):return mid in self.dub_detached
    def voice_items(self):
        """sounds on the timeline, without the ones an English dub replaces"""
        return [a for a in self.audio if not self.use_dub(a['media'])]
    def dub_items(self):
        """dub segments still glued to the picture, placed on the program timeline like free audio items"""
        out=[];acc=0.0;gain=self.data.get('dub_gain',1.0)
        for a in self.audio:
            # a voice-over recorded as a separate file is dubbed in place of that sound
            dub=self.dubs.get(a['media'])
            if not dub or not self.use_dub(a['media']) or self.detached(a['media']):continue
            for s in dub.get('segments',[]):
                if not s.get('file'):continue
                x=max(s['start'],a['in']);y=min(s['start']+s.get('dur',0),a['out'])
                if y-x<.05:continue
                out.append({'id':f"dub-{a['id']}-{s['id']}",'path':s['file'],'start':a['start']+x-a['in'],'in':x-s['start'],'out':y-s['start'],
                            'gain':gain*a.get('gain',1.0),'fade_in':0.0,'fade_out':.03,'dub':True,'text':s.get('en',''),'src':a['media'],'src_dur':s.get('dur',0)})
        for c in self.main:
            dub=self.dubs.get(c['media'])
            if dub and self.dub_active() and not c.get('muted') and not self.detached(c['media']):
                sp=speed_of(c)  # a sped-up clip carries its narration along at the same rate
                for s in dub.get('segments',[]):
                    if not s.get('file'):continue
                    a=max(s['start'],c['in']);b=min(s['start']+s.get('dur',0),c['out'])
                    if b-a<.05:continue
                    out.append({'id':f"dub-{c['id']}-{s['id']}",'path':s['file'],'start':acc+(a-c['in'])/sp,'in':a-s['start'],'out':b-s['start'],'speed':sp,
                                'gain':gain*c.get('gain',1.0),'fade_in':0.0,'fade_out':.03,'dub':True,'text':s.get('en',''),'src':c['media'],'src_dur':s.get('dur',0)})
            acc+=self.dur(c)
        return out
    def dub_end(self,a):return a['start']+(a['out']-a['in'])/speed_of(a)
    def dubtrack_items(self):
        """detached dub lines for the player and the export; the panel's master gain still rides on top"""
        if not self.dub_active():return []
        g=self.data.get('dub_gain',1.0)
        return [dict(a,gain=a.get('gain',1.0)*g,dub=True) for a in self.dubtrack if a['out']-a['in']>=.02]
    def detach_dub(self,mid):
        """freeze the dub of one recording exactly where it sits now, as blocks that move on their own"""
        if self.detached(mid):return 0
        lines=[a for a in self.dub_items() if a.get('src')==mid]
        if not lines:return 0
        g=self.data.get('dub_gain',1.0) or 1.0
        for a in sorted(lines,key=lambda x:x['start']):
            self.dubtrack.append({'id':new_id(),'path':a['path'],'start':round(max(0.0,a['start']),4),'in':round(a['in'],4),'out':round(a['out'],4),
                                  'dur':round(max(a['out'],a.get('src_dur') or a['out']),4),'gain':round(a['gain']/g,4),'speed':speed_of(a),
                                  'fade_in':0.0,'fade_out':.03,'text':a.get('text',''),'src':mid})
        self.dub_detached.append(mid);return len(lines)
    def attach_dub(self,mid):
        """back to lines glued to the picture; the hand-made placement of that recording is dropped"""
        if not self.detached(mid):return 0
        n=sum(1 for a in self.dubtrack if a.get('src')==mid)
        self.dubtrack[:]=[a for a in self.dubtrack if a.get('src')!=mid];self.dub_detached.remove(mid);return n
    def split_dub(self,t):
        """cut the detached dub line under program time t in two"""
        for k,a in enumerate(self.dubtrack):
            if a['start']+MIN_CLIP<t<self.dub_end(a)-MIN_CLIP:
                src=a['in']+(t-a['start'])
                self.dubtrack[k:k+1]=[dict(copy.deepcopy(a),out=src),dict(copy.deepcopy(a),id=new_id(),start=t,**{'in':src})];return True
        return False
    def item_path(self,a):return a.get('path') or self.media_of(a)['path']
    def append_project(self,other):
        """glue a whole finished edit onto the end of this one: clips, sounds, effects, dub lines and markers.
        -> (clips added, clips skipped because their source file is gone)"""
        offset=self.duration();remap={};added=skipped=0
        for mid,m in other.media.items():
            try:remap[mid]=self.add_media(m['path'])
            except Exception:continue  # a missing source drops its own clips instead of killing the whole merge
        for c in other.main:
            if c['media'] not in remap:skipped+=1;continue
            self.main.append(dict(copy.deepcopy(c),id=new_id(),media=remap[c['media']]));added+=1
        for a in other.audio:
            if a['media'] in remap:self.audio.append(dict(copy.deepcopy(a),id=new_id(),media=remap[a['media']],start=round(a['start']+offset,4)))
        for e in other.effects:
            self.effects.append(dict(copy.deepcopy(e),id=new_id(),start=round(e['start']+offset,4)))
        for a in other.dubtrack:
            self.dubtrack.append(dict(copy.deepcopy(a),id=new_id(),start=round(a['start']+offset,4),src=remap.get(a.get('src'),a.get('src'))))
        for mid,dub in other.dubs.items():
            # a recording that is already dubbed here keeps the dub it has; only new ones bring theirs along
            if mid in remap and remap[mid] not in self.dubs:self.dubs[remap[mid]]=copy.deepcopy(dub)
        for mid in other.dub_detached:
            if mid in remap and remap[mid] not in self.dub_detached:self.dub_detached.append(remap[mid])
        seen={(m.get('media'),round(m.get('t',0),3),m.get('kind')) for m in self.markers}
        for m in other.markers:
            key=(remap.get(m.get('media')),round(m.get('t',0),3),m.get('kind'))
            if key[0] and key not in seen:self.markers.append(dict(m,media=remap[m['media']]));seen.add(key)
        return added,skipped
    def excerpt(self,start,end):
        """copy of the project cut down to program time [start, end): used for quick previews"""
        q=Project(self.path,copy.deepcopy(self.data));total=q.duration();end=min(end,total);start=max(0.0,min(start,end))
        if end<total-MIN_CLIP:
            q.split(end);cut=q.boundary_index(end)
            while len(q.main)>cut:q.delete_main(len(q.main)-1)
        if start>MIN_CLIP:
            # sounds and effects already running at 'start' are trimmed so they continue mid-way instead of restarting
            for a in list(q.audio):
                if q.audio_end(a)<=start:q.audio.remove(a)
                elif a['start']<start:a['in']+=start-a['start'];a['start']=start;a['fade_in']=0.0
            for a in list(q.dubtrack):
                if q.dub_end(a)<=start:q.dubtrack.remove(a)
                elif a['start']<start:a['in']+=start-a['start'];a['start']=start;a['fade_in']=0.0
            for e in list(q.effects):
                if e['start']+e['duration']<=start:q.effects.remove(e)
                elif e['start']<start:e['duration']-=start-e['start'];e['start']=start
            q.split(start);cut=q.boundary_index(start)
            for _ in range(cut):q.delete_main(0)
        return q
    def pauses(self):
        return sorted(t for m in self.markers if m['kind']=='Pauza' for t in self.program_times(m['media'],m['t']))
    # --- second pass ("Film końcowy"): one merged file, cut as a whole; reels and intro are taken from it
    @property
    def reels(self):return self.data.setdefault('reels',[]) if self.data.get('kind')=='final' else self.data.get('reels',[])
    @classmethod
    def create_final(cls,master,source,silence=(),subs=()):
        """source: the montage project the master was rendered from. Its markers land on the master at their programme
        time, its speech subtitles are kept aside (only reels may use them), silence feeds the automatic speed-up"""
        p=cls.empty(f'{source.name} – film końcowy',FINAL_PROJECTS);p.data['kind']='final';p.data['source_project']=str(source.path)
        mid=p.add_media(master);p.insert_main(0,mid);p.data['master']=mid
        for m in source.markers:
            for t in source.program_times(m['media'],m['t']):p.markers.append({'t':round(t,3),'kind':m['kind'],'note':m.get('note',''),'media':mid})
        p.data['silence']=[[round(a,3),round(b,3)] for a,b in silence]
        p.data['reel_subs']=[copy.deepcopy(e) for e in subs]
        p.data['reels']=[];p.save();return p
    def range_pieces(self,a,b):
        """cut the main track at programme times a and b -> (first, last+1) index of the clips between them"""
        total=self.duration();a=max(0.0,min(a,total));b=max(a,min(b,total))
        if b<total-MIN_CLIP:self.split(b)
        if a>MIN_CLIP:self.split(a)
        return self.boundary_index(a),self.boundary_index(b)
    def cut_range(self,a,b):
        i,j=self.range_pieces(a,b)
        for k in range(j-1,i-1,-1):self.delete_main(k)
        return j-i
    def speed_range(self,a,b,factor):
        """everything between a and b plays factor times faster (0.5 = slow motion); returns the clips changed"""
        i,j=self.range_pieces(a,b)
        for k in range(j-1,i-1,-1):self.set_speed(k,speed_of(self.main[k])*factor)
        return j-i
    def intro_count(self):
        n=0
        while n<len(self.main) and self.main[n].get('intro'):n+=1
        return n
    def add_to_intro(self,a,b):
        """copy programme stretch [a, b) to the intro at the very start (after the fragments already there).
        The film itself starts after the intro with a white flash, like a trailer cut into the episode."""
        piece=self.excerpt(a,b);clips=[dict(copy.deepcopy(c),id=new_id(),intro=True) for c in piece.main]
        for c in clips:c.pop('trans',None);c.pop('auto_fast',None)
        if not clips:return 0.0
        at=self.intro_count();start=self.clip_start(at);length=sum(self.dur(c) for c in clips)
        self.main[at:at]=clips;self.ripple(start,length)
        film=at+len(clips)
        if film<len(self.main) and not self.main[film].get('trans'):self.main[film]['trans']={'type':'fadewhite','duration':.5}
        return length
    def speed_up_silence(self,factor=2.0,min_gap=1.5,pad=.25):
        """every pause in speech of at least min_gap seconds plays factor times faster. The pauses were measured on the
        microphone before merging (the merged file mixes voice and game). Stretches that were already retimed stay as
        they are, so running it twice does nothing new. -> (pauses sped up, seconds saved)"""
        mid=self.data.get('master');gaps=[(a+pad,b-pad) for a,b in self.data.get('silence',[]) if b-a>=min_gap and b-a-2*pad>=MIN_CLIP*3]
        if not gaps:return 0,0.0
        before=self.duration();n=0
        for i in range(len(self.main)-1,-1,-1):
            c=self.main[i]
            if c['media']!=mid or speed_of(c)!=1.0 or c.get('intro'):continue
            for a,b in sorted(((max(a,c['in']),min(b,c['out'])) for a,b in gaps),reverse=True):
                c=self.main[i]
                if b-a<MIN_CLIP*3 or a<c['in']-1e-6 or b>c['out']+1e-6:continue
                start=self.clip_start(i)
                if c['out']-b>=MIN_CLIP:self.split(start+(b-c['in']))
                k=i
                if a-c['in']>=MIN_CLIP:self.split(start+(a-c['in']));k=i+1
                self.set_speed(k,factor);self.main[k]['auto_fast']=True;n+=1
        return n,before-self.duration()
    def reset_auto_fast(self):
        n=0
        for i in range(len(self.main)-1,-1,-1):
            if self.main[i].pop('auto_fast',None):self.set_speed(i,1.0);n+=1
        return n
    def add_reel(self,a,b,name=None):
        n=len(self.reels)+1
        reel={'id':new_id(),'name':name or f'Rolka {n}','start':round(a,3),'duration':round(max(MIN_CLIP,b-a),3),'format':'crop','pan':0.0,'subs':False}
        self.reels.append(reel);return reel
    def film_name(self):
        return safe_name(self.name.replace(' – film końcowy','')) or 'Film'
    def reel_files(self):
        """{reel id: path} of the Rolki projects made from this film (client folder named after the film)"""
        out={};folder=REELS_PROJECTS/self.film_name()
        for f in folder.glob('*.json') if folder.exists() else []:
            try:d=json.loads(f.read_text('utf-8'))
            except (OSError,ValueError):continue
            if d.get('from_final')==str(self.path) and d.get('reel_id'):out[d['reel_id']]=f
        return out
    @staticmethod
    def reel_touched(path):
        """edited in the Rolki tab (or marked there as in progress / ready): from then on the film no longer rewrites it"""
        try:d=json.loads(pathlib.Path(path).read_text('utf-8'))
        except (OSError,ValueError):return False
        return bool(d.get('edited')) or d.get('status') in REEL_STATUSES[1:3]  # exported from the film alone is not an edit
    def sync_reels(self):
        """every reel of the film is also a project in Rolki (client = film name), ready to watch and polish there.
        Untouched ones follow the film: new range, format, cuts. Removed reels take their untouched project along.
        -> {reel id: path}"""
        files=self.reel_files();ids={r['id'] for r in self.reels};client=self.film_name();folder=REELS_PROJECTS/client
        for rid,f in files.items():
            if rid not in ids and not self.reel_touched(f):f.unlink(missing_ok=True)
        for r in self.reels:
            f=files.get(r['id'])
            if f and self.reel_touched(f):continue
            if not f:
                base=safe_name(r['name']) or 'Rolka';f=folder/f'{base}.json';n=2
                while f.exists():f=folder/f'{base} ({n}).json';n+=1
            q=self.reel_project(r)
            for key in ('silence','reel_subs','master','source_project','reels'):q.data.pop(key,None)
            q.data.update(kind='reel',client=client,status=REEL_STATUSES[0],name=r['name'],from_final=str(self.path),reel_id=r['id'])
            files[r['id']]=f
            try:old=json.loads(f.read_text('utf-8'))
            except (OSError,ValueError):old=None
            # clip ids are new on every cut-out, so they do not count as a change
            same=lambda d:json.dumps({k:([{x:v for x,v in i.items() if x!='id'} for i in d.get(k) or []] if k in ('main','effects','audio') else d.get(k))
                                      for k in ('main','effects','audio','output','name','media')},sort_keys=True)
            if old and same(old)==same(q.data):continue  # nothing new: keep it as it is (an exported reel keeps its ✓)
            q.path=f;q.save()
        return {rid:f for rid,f in files.items() if rid in ids}
    def reel_project(self,reel,width=1080,height=1920):
        """the reel as its own vertical project: the stretch of the film, framed as the reel asks, subtitles if wanted"""
        q=self.excerpt(reel['start'],reel['start']+reel['duration']);F=self.output()[2]
        q.data['output']={'width':width,'height':height,'fps':F};q.data['reels']=[];q.data['kind']='reel-cut'
        for c in q.main:c['fit']='blur' if reel.get('format')=='blur' else 'cover';c['pan']=float(reel.get('pan',0.0))
        q.data['effects']=[e for e in q.effects if not e.get('subtitle')]
        if reel.get('subs'):
            for s in self.data.get('reel_subs',[]):
                # subtitles live in the master's own time; they follow the cuts and the retiming of the film
                for t in self.program_times(self.data.get('master'),s['start']):
                    i,_=self.locate(t);sp=speed_of(self.main[i]) if i>=0 else 1.0;t0=t-reel['start']
                    if 0<=t0<reel['duration']:q.effects.append(dict(copy.deepcopy(s),id=new_id(),start=round(t0,3),duration=round(min(s['duration']/sp,reel['duration']-t0),3)))
        return q

def migrate(data):
    """v1 (single recording, 'clips') -> v2"""
    if data.get('version',1)>=2:
        for key in ('media','main','audio','effects','markers','dubtrack','dub_detached'):data.setdefault(key,{} if key=='media' else [])
        return data
    mid=new_id();info=dict(data['info'],has_video=True)
    return {'version':2,'name':pathlib.Path(data['source']).stem,'media':{mid:{'path':data['source'],'kind':'video','info':info}},
            'main':[{'id':new_id(),'media':mid,'in':c['in'],'out':c['out'],'gain':1.0,'muted':False} for c in data.get('clips',[])],
            'audio':[],'effects':[],'markers':[dict(m,media=mid) for m in data.get('markers',[])],'volumes':data.get('volumes',{'mic':1.0,'game':1.0})}

def extract_peaks(src,audio_index,target):
    """Linear peak (0-255) per 1/PEAK_RATE s of one audio stream, cached in target."""
    if target.exists():return array('B',target.read_bytes())
    rate=8000;block=rate//PEAK_RATE;size=block*2
    p=subprocess.Popen([str(FFMPEG),'-v','error','-i',str(src),'-map',f'0:a:{audio_index}','-ac','1','-ar',str(rate),'-f','s16le','-'],stdout=subprocess.PIPE,stderr=subprocess.DEVNULL,creationflags=NO_WINDOW)
    out=array('B');rest=b''
    while chunk:=p.stdout.read(size*2048):
        data=rest+chunk;n=len(data)//size*size;rest=data[n:];a=array('h');a.frombytes(data[:n])
        for j in range(0,len(a),block):
            seg=a[j:j+block];out.append(min(255,max(max(seg),-min(seg))>>7))
    if p.wait():raise RuntimeError('FFmpeg nie odczytał dźwięku.')
    tmp=target.with_suffix('.tmp');tmp.write_bytes(out.tobytes());os.replace(tmp,target);return out

def merge_ranges(ranges,join=0.0):
    out=[]
    for a,b in sorted(ranges):
        if out and a<=out[-1][1]+join:out[-1][1]=max(out[-1][1],b)
        else:out.append([a,b])
    return out

def silent_ranges(p,min_len=.8,window=.2):
    """programme-time stretches where nobody talks, measured before merging: the microphone of every clip (a noisy mic
    raises its own threshold), English dub lines and AI narration count as talking. Clips that cannot be judged
    (cards, images, muted clips, files without a microphone track) count as talking too, so they are never sped up."""
    speech=[];acc=0.0;step=max(1,int(window*PEAK_RATE))
    for c in p.main:
        d=p.dur(c);m=p.media_of(c);sp=speed_of(c);mic,_=audio_indexes(m['info'].get('audio'))
        dubbed=p.use_dub(c['media'])
        if m['kind']!='video' or c.get('muted') or (mic is None and not dubbed) or 'plansza' in pathlib.Path(m['path']).stem.lower():
            speech.append((acc,acc+d))
        elif not dubbed:  # a dubbed clip talks only where its dub lines are (added below)
            try:peaks=extract_peaks(m['path'],mic,media_cache(m['path'])/'mic.peaks')
            except Exception:peaks=None
            if not peaks:speech.append((acc,acc+d))
            else:
                lo=int(c['in']*PEAK_RATE);hi=min(len(peaks),int(c['out']*PEAK_RATE))
                quiet=sorted(peaks[lo:hi])[int((hi-lo)*.2)] if hi>lo else 0  # the room noise of this take
                level=max(SPEECH_MIN,quiet*4)
                for j in range(lo,hi,step):
                    if sum(1 for v in peaks[j:j+step] if v>=level)>=max(2,step//5):
                        s=acc+(j/PEAK_RATE-c['in'])/sp;speech.append((s,s+window/sp))
        acc+=d
    for a in p.dub_items()+p.dubtrack_items():speech.append((a['start'],a['start']+(a['out']-a['in'])/speed_of(a)))
    for a in p.voice_items():
        if 'narrator' in p.item_path(a).lower():speech.append((a['start'],p.audio_end(a)))
    talk=merge_ranges(speech,.35);out=[];t=0.0
    for a,b in talk+[[acc,acc]]:
        if a-t>=min_len:out.append((round(t,3),round(a,3)))
        t=max(t,b)
    return out

def extract_thumbs(src,folder):
    """One small JPEG per keyframe (fast: no full decode). Returns [(source time, path)]."""
    meta=folder/'thumbs.json'
    if meta.exists():return [(t,folder/n) for t,n in json.loads(meta.read_text('utf-8'))]
    folder.mkdir(parents=True,exist_ok=True)
    p=subprocess.run([str(FFMPEG),'-hide_banner','-v','info','-skip_frame','nokey','-i',str(src),'-map','0:v:0','-an','-vf','scale=192:108:force_original_aspect_ratio=decrease,pad=192:108:(ow-iw)/2:(oh-ih)/2,showinfo','-fps_mode','passthrough','-q:v','6',str(folder/'%05d.jpg')],capture_output=True,creationflags=NO_WINDOW)
    if p.returncode:raise RuntimeError('FFmpeg nie wygenerował miniatur.')
    times=[float(t) for t in re.findall(r'pts_time:\s*(-?[\d.]+)',p.stderr.decode('utf-8','replace'))]
    items=[(max(0.0,t),f'{i+1:05}.jpg') for i,t in enumerate(times) if (folder/f'{i+1:05}.jpg').exists()]
    meta.write_text(json.dumps(items),'utf-8');return [(t,folder/n) for t,n in items]
