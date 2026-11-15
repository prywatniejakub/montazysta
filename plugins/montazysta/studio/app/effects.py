import os as _os_font
_C4Y_FONT = ("C\\:/Windows/Fonts/arialbd.ttf" if _os_font.name == "nt" else "/System/Library/Fonts/Supplemental/Arial Bold.ttf")
"""One-click blocks: effect definitions shared by the live preview (Python) and the export (FFmpeg expressions)."""
import hashlib,math,os,pathlib,re,subprocess,tempfile

FONT='C:/Windows/Fonts/impact.ttf' if pathlib.Path('C:/Windows/Fonts/impact.ttf').exists() else 'C:/Windows/Fonts/arialbd.ttf'
OUT_H=1080  # effect offsets are defined in 1080p pixels and scaled to the preview/output size

EFFECTS={
    'zoom':{'label':'Zoom','icon':'🔍','color':'#8aa9ff','duration':1.5,'params':{'strength':1.3}},
    'shake':{'label':'Trzęsienie','icon':'〰','color':'#ff795d','duration':0.8,'params':{'amount':1.0}},
    'boost':{'label':'Głośniej','icon':'🔊','color':'#c5e58c','duration':2.0,'params':{'db':6.0}},
    'flash':{'label':'Flash','icon':'⚡','color':'#f4f1e8','duration':0.35,'params':{}},
    'color':{'label':'Filtr koloru','icon':'🎨','color':'#6ad3a0','duration':4.0,'params':{'look':'cold','strength':1.0}},
    'text':{'label':'Napis','icon':'T','color':'#b29bfa','duration':2.5,'params':{'text':'NO WAY!','style':'mrbeast','size':110,'x':0.5,'y':0.78,'anim':'pop'}},
    'cta':{'label':'Przycisk CTA','icon':'▭','color':'#ffffff','duration':3.0,'params':{'text':'UMÓW WIZYTĘ','style':'cta','component':'cta','accent':'#ffffff','component_bg':'#101214','component_opacity':0.84,'size':54,'x':0.5,'y':0.82,'anim':'fade'}},
    'offer':{'label':'Karta oferty','icon':'◆','color':'#ff795d','duration':4.0,'params':{'text':'PAKIET BEAUTY\n3 ZABIEGI  •  499 ZŁ\nWARSZAWA  •  MOKOTÓW','style':'offer','component':'offer','accent':'#ff795d','component_bg':'#111316','component_opacity':0.88,'align':'left','size':48,'x':0.5,'y':0.67,'anim':'fade'}},
    'lines':{'label':'Tekst w wierszach','icon':'☰','color':'#f4cd78','duration':4.0,'params':{'text':'GŁADKA SKÓRA\nWIĘCEJ BLASKU\nEFEKT OD RAZU','style':'clean_lines','component':'stack','accent':'#ffffff','component_bg':'#101214','component_opacity':0.82,'align':'left','size':54,'x':0.5,'y':0.55,'anim':'fade'}},
    # a picture (usually an emoji rendered to PNG) laid over the film; 'size' is its height as a share of the frame height
    'sticker':{'label':'Naklejka','icon':'😭','color':'#ffd35a','duration':1.2,'params':{'path':'','x':0.5,'y':0.32,'size':0.14,'anim':'boom'}},
}
TEXT_EFFECTS=('text','cta','offer','lines')
def is_text_effect(item):return item.get('type') in TEXT_EFFECTS

POSITIONS={'top':'Góra','middle':'Środek','bottom':'Dół'}

# ------------------------------------------------------------------ colour looks
# eq and colorbalance both take a timeline 'enable', so one look covers just its own stretch of the film.
# 'tint'/'alpha' are only the rough colour the editor lays over the picture; the export is the filter chain.
COLOR_LOOKS={
    'cold':  {'label':'Zimny niebieski','tint':'#3f7ad0','alpha':.26,'eq':{'contrast':1.12,'saturation':.78},'bal':{'rs':-.10,'bs':.20,'bm':.12}},
    'night': {'label':'Noc / horror','tint':'#1d3f6b','alpha':.34,'eq':{'contrast':1.18,'brightness':-.08,'saturation':.55},'bal':{'bs':.18,'rs':-.10}},
    'warm':  {'label':'Ciepły zachód','tint':'#ff9a3c','alpha':.22,'eq':{'contrast':1.06,'saturation':1.18},'bal':{'rs':.16,'bs':-.12,'rm':.08}},
    'purple':{'label':'Fiolet pod intro','tint':'#a45cff','alpha':.28,'eq':{'contrast':1.10,'saturation':1.10},'bal':{'bs':.22,'rs':.10,'gs':-.10,'bm':.14}},
    'green': {'label':'Zielony Matrix','tint':'#2fbf6a','alpha':.26,'eq':{'contrast':1.12,'saturation':.72},'bal':{'gs':.22,'rs':-.12,'gm':.12}},
    'red':   {'label':'Czerwony alarm','tint':'#ff2e2e','alpha':.26,'eq':{'contrast':1.16,'saturation':1.15},'bal':{'rs':.26,'bs':-.14,'rm':.12}},
    'dream': {'label':'Sen / róż','tint':'#ff7ad0','alpha':.24,'eq':{'contrast':.96,'saturation':1.20,'brightness':.04},'bal':{'rh':.16,'bh':.12,'gs':-.06}},
    'sepia': {'label':'Sepia retro','tint':'#8a6a3a','alpha':.34,'eq':{'contrast':1.05,'saturation':.28},'bal':{'rs':.20,'gs':.06,'bs':-.16}},
    'bw':    {'label':'Czarno-biały','tint':'#808080','alpha':.34,'eq':{'contrast':1.14,'saturation':0.0},'bal':{}},
    'faded': {'label':'Wyblakły film','tint':'#c8b9a0','alpha':.16,'eq':{'contrast':.90,'saturation':.82,'brightness':.05},'bal':{'rh':.06,'bs':.06}},
    'vivid': {'label':'Mocno nasycony','tint':'#ffd24d','alpha':.10,'eq':{'contrast':1.16,'saturation':1.55,'brightness':.02},'bal':{}},
    'dark':  {'label':'Przyciemnienie','tint':'#000000','alpha':.36,'eq':{'contrast':1.06,'brightness':-.12,'saturation':.90},'bal':{}},
}
DEFAULT_LOOK='cold'
EQ_NEUTRAL={'contrast':1.0,'saturation':1.0,'gamma':1.0,'brightness':0.0}
def look_of(e):return COLOR_LOOKS.get(e.get('look'),COLOR_LOOKS[DEFAULT_LOOK])
def look_strength(e):return max(0.0,min(1.5,float(e.get('strength',1.0) or 0)))

def color_chain(e):
    """one look as FFmpeg filters, faded toward neutral by its strength, switched on only in its own window"""
    look=look_of(e);k=look_strength(e);s=e['start'];enable=f"enable='between(t,{s:.3f},{s+e['duration']:.3f})'"
    out=[]
    eq={key:EQ_NEUTRAL[key]+(val-EQ_NEUTRAL[key])*k for key,val in look['eq'].items()}
    if eq:out.append('eq='+':'.join(f'{key}={val:.4f}' for key,val in sorted(eq.items()))+':'+enable)
    bal={key:val*k for key,val in look['bal'].items() if abs(val*k)>1e-4}
    if bal:out.append('colorbalance='+':'.join(f'{key}={val:.4f}' for key,val in sorted(bal.items()))+':'+enable)
    return out

def color_filter(effects):
    """the whole grade for the programme as one chain; None when nothing is graded"""
    chain=[]
    for e in sorted((x for x in effects if x.get('type')=='color'),key=lambda x:x['start']):chain+=color_chain(e)
    return ','.join(chain) if chain else None

def tint_at(effects,t):
    """(colour, opacity) for the editor's rough live preview of a look; None where nothing is graded"""
    for e in sorted((x for x in effects if x.get('type')=='color'),key=lambda x:x['start']):
        if e['start']<=t<e['start']+e['duration']:
            a=look_of(e)['alpha']*look_strength(e)
            if a>.01:return look_of(e)['tint'],min(.85,a)
    return None

# ------------------------------------------------------------------ caption styles
FONTS={  # key: (file for FFmpeg, Qt family, bold, label)
    'impact':('impact.ttf','Impact',False,'Impact'),'arial_black':('ariblk.ttf','Arial Black',False,'Arial Black'),
    'arial_bold':('arialbd.ttf','Arial',True,'Arial pogrubiony'),'segoe_black':('seguibl.ttf','Segoe UI Black',False,'Segoe UI Black'),
    'comic':('comicbd.ttf','Comic Sans MS',True,'Comic Sans'),'bahnschrift':('bahnschrift.ttf','Bahnschrift',True,'Bahnschrift'),
    'consolas':('consolab.ttf','Consolas',True,'Consolas'),'georgia':('georgiab.ttf','Georgia',True,'Georgia'),
}
# fonts that ship with the studio (app/fonts) instead of Windows: stored with their full path
APP_FONTS=pathlib.Path(__file__).resolve().parent/'fonts'
if (APP_FONTS/'gotham-ultra.ttf').exists():FONTS['gotham']=(str(APP_FONTS/'gotham-ultra.ttf'),'Gotham',False,'Gotham Ultra')
ASS_FAMILY={'gotham':'Gotham Ultra'}  # libass reads the family from the file's name table; Qt (DirectWrite) calls the same file 'Gotham'
_app_fonts=False
def register_app_fonts():
    """the studio's own font files, registered once with Qt (after the QApplication exists) so the preview can draw them"""
    global _app_fonts
    if _app_fonts:return
    from PySide6.QtGui import QFontDatabase
    for key,(f,family,bold,title) in list(FONTS.items()):
        if os.path.isabs(f) and os.path.exists(f):
            fams=QFontDatabase.applicationFontFamilies(QFontDatabase.addApplicationFont(f))
            if fams:FONTS[key]=(f,fams[0],bold,title)
    _app_fonts=True
def is_app_font(key):return os.path.isabs(FONTS.get(key,FONTS['impact'])[0])
def ass_family(key):return ASS_FAMILY.get(key) or FONTS.get(key,FONTS['impact'])[1]
_ass_scale={}
def ass_scale(key,default):
    """libass sizes a font by its Windows line height (usWinAscent + usWinDescent), the preview and drawtext by the em.
    For a studio font this factor, read from the file, keeps both the same size; the Windows fonts keep the studio's
    long-standing constant (default), so older projects export exactly as before."""
    f=FONTS.get(key,FONTS['impact'])[0]
    if not os.path.isabs(f):return default
    if f not in _ass_scale:
        try:
            import struct
            d=pathlib.Path(f).read_bytes();t={}
            for i in range(struct.unpack('>H',d[4:6])[0]):tag,_,off,_=struct.unpack('>4sIII',d[12+16*i:28+16*i]);t[tag]=off
            upem=struct.unpack('>H',d[t[b'head']+18:t[b'head']+20])[0];wa,wd=struct.unpack('>HH',d[t[b'OS/2']+74:t[b'OS/2']+78])
            _ass_scale[f]=(wa+wd)/upem
        except Exception:_ass_scale[f]=default
    return _ass_scale[f]
TEXT_DEFAULTS={'font':'impact','color':'#ffffff','outline':'#000000','outline_w':0.09,'box':False,'box_color':'#000000','box_opacity':0.65,
               'shadow':False,'shadow_color':'#000000','upper':False}
STYLE_KEYS=tuple(TEXT_DEFAULTS)
TEXT_STYLES={
    'mrbeast':{'label':'MrBeast','font':'impact','color':'#ffe600','outline_w':.15,'shadow':True,'upper':True},
    'youtube':{'label':'YouTube klasyk','font':'impact','color':'#ffffff','outline_w':.1},
    'hormozi':{'label':'Hormozi','font':'segoe_black','color':'#ffffff','outline_w':.13,'shadow':True,'upper':True},
    'hormozi_green':{'label':'Hormozi zielony','font':'segoe_black','color':'#39ff6a','outline_w':.13,'shadow':True,'upper':True},
    'tiktok':{'label':'TikTok','font':'arial_bold','color':'#ffffff','outline_w':0,'box':True,'box_opacity':.75},
    'tiktok_white':{'label':'TikTok jasny','font':'arial_bold','color':'#111111','outline_w':0,'box':True,'box_color':'#ffffff','box_opacity':.95},
    'alarm':{'label':'Alarm','font':'arial_black','color':'#ff2e2e','outline':'#ffffff','outline_w':.11,'shadow':True,'upper':True},
    'neon':{'label':'Neon','font':'bahnschrift','color':'#e9fdff','outline':'#00a8ff','outline_w':.1,'shadow':True,'shadow_color':'#00e1ff'},
    'comic':{'label':'Komiks','font':'comic','color':'#ffffff','outline':'#1c3fae','outline_w':.12,'shadow':True},
    'minecraft':{'label':'Minecraft','font':'consolas','color':'#ffffff','outline_w':0,'shadow':True,'shadow_color':'#3f3f3f'},
    'film':{'label':'Napisy filmowe','font':'arial_bold','color':'#ffffff','outline_w':0,'box':True,'box_opacity':.5},
    'cta':{'label':'CTA · biała ramka','font':'arial_bold','color':'#ffffff','outline_w':0,'shadow':False,'upper':True},
    'offer':{'label':'Oferta premium','font':'arial_bold','color':'#ffffff','outline_w':0,'shadow':False,'upper':False},
    'clean_lines':{'label':'Czyste wiersze','font':'bahnschrift','color':'#ffffff','outline_w':0,'shadow':False,'upper':True},
}
ANIMATIONS={'pop':'Wyskok','snap':'Szybki wyskok (bez przenikania) – clipping','boom':'Boom – mocne odbicie','soft':'Łagodne pojawienie',
            'zoom':'Powiększenie','slide':'Wjazd od dołu','drop':'Spadek z góry','fade':'Pojawienie','none':'Brak'}
FADE_OUT=.12

def _clamp(v):return max(0.0,min(1.0,v))
def fade_out_of(e):
    """seconds a caption fades out; fast clip captions set 0 - they are replaced by the next one, not faded"""
    try:return max(0.0,min(.5,float(e.get('fade_out',FADE_OUT))))
    except (TypeError,ValueError):return FADE_OUT

def caption_motion(anim,start,duration,t,fade_out=FADE_OUT):
    """(opacity, vertical offset as a fraction of frame height, scale) at time t. The same curves are written as
    FFmpeg expressions in caption_expressions() and as ASS tags in subtitles.ass_animation()."""
    k=t-start;out=_clamp((start+duration-t)/fade_out) if fade_out>1e-4 else (1.0 if t<=start+duration else 0.0)
    if anim=='none':return out,0.0,1.0
    if anim=='snap':return out,0.0,.86+.14*_clamp(k/.08)
    if anim=='fade':return min(_clamp((k+.034)/.2),out),0.0,1.0
    if anim=='pop':return min(_clamp((k+.034)/.1),out),0.0,.82+.18*_clamp(k/.12)
    if anim=='boom':
        scale=1.35-.43*_clamp(k/.12) if k<.12 else .92+.08*_clamp((k-.12)/.12)
        return min(_clamp((k+.034)/.05),out),0.0,scale
    if anim=='soft':
        e=1-(1-_clamp(k/.4))**3;return min(_clamp((k+.034)/.4),out),.012*(1-e),.94+.06*e
    if anim=='zoom':
        e=1-(1-_clamp(k/.22))**2;return min(_clamp((k+.034)/.15),out),0.0,.5+.5*e
    if anim=='slide':return min(_clamp((k+.034)/.25),out),.05*(1-_clamp(k/.25))**2,1.0
    if anim=='drop':return min(_clamp((k+.034)/.25),out),-.05*(1-_clamp(k/.25))**2,1.0
    return out,0.0,1.0

def caption_expressions(anim,start,duration,fade_out=FADE_OUT):
    """FFmpeg (alpha, vertical offset in frame heights, scale) expressions matching caption_motion"""
    s=f'{start:.3f}';k=f'(t-{s})';out=f'({start+duration:.3f}-t)/{fade_out}' if fade_out>1e-4 else '1'
    c=lambda e:f'max(0,min(1,{e}))'
    fade=lambda d:f'max(0,min(1,min(({k}+0.034)/{d},{out})))'
    if anim=='none':return c(out),'0','1'
    if anim=='snap':return c(out),'0',f'(0.86+0.14*{c(k+"/0.08")})'
    if anim=='fade':return fade(.2),'0','1'
    if anim=='pop':return fade(.1),'0',f'(0.82+0.18*{c(k+"/0.12")})'
    if anim=='boom':return fade(.05),'0',f"if(lt({k},0.12),1.35-0.43*{c(k+'/0.12')},0.92+0.08*{c('('+k+'-0.12)/0.12')})"
    if anim=='soft':
        e=f'(1-pow(1-{c(k+"/0.4")},3))';return fade(.4),f'0.012*(1-{e})',f'(0.94+0.06*{e})'
    if anim=='zoom':return fade(.15),'0',f'(0.5+0.5*(1-pow(1-{c(k+"/0.22")},2)))'
    if anim=='slide':return fade(.25),f'0.05*pow(1-{c(k+"/0.25")},2)','1'
    if anim=='drop':return fade(.25),f'-0.05*pow(1-{c(k+"/0.25")},2)','1'
    return c(out),'0','1'

def text_props(e):
    """resolved caption look: defaults <- style <- the effect's own overrides (older projects used 'position')"""
    style=TEXT_STYLES.get(e.get('style'),TEXT_STYLES['youtube'])
    props={**TEXT_DEFAULTS,**{k:v for k,v in style.items() if k!='label'},**{k:e[k] for k in STYLE_KEYS if k in e}}
    y=e['y'] if 'y' in e else {'top':.12,'middle':.5}.get(e.get('position'),.85)
    text=e.get('text','');component=e.get('component',{'offer':'offer','cta':'cta','lines':'stack'}.get(e.get('type'),'text'));default_align='left' if component in ('offer','stack') else 'center'
    props.update(text=text.upper() if props['upper'] else text,size=e.get('size',110),x=e.get('x',.5),y=y,anim=e.get('anim','fade'),
        component=component,accent=e.get('accent','#ffffff'),component_bg=e.get('component_bg','#111111'),component_opacity=e.get('component_opacity',.7),align=e.get('align',default_align),card_theme=e.get('card_theme','ivory'),card_accent=e.get('card_accent'),
        emph=list(e.get('emph') or []),emph_color=e.get('emph_color',EMPH_COLOR),emph_scale=float(e.get('emph_scale',EMPH_SCALE)))
    return props

def font_file(key):
    f=FONTS.get(key,FONTS['impact'])[0]
    return f.replace('\\','/') if os.path.isabs(f) else 'C:/Windows/Fonts/'+f

# ------------------------------------------------------------------ a picture in a band ('box' clips)
# The letterbox look of clipping reels: the picture fills the frame's width at a set height, black above and below,
# with room for a hook over it and a comment bait under it. 'box': {'y': top, 'h': height}, both shares of the height.
BOX={'y':.3125,'h':.38}
def box_of(c):
    """(top, height) of a 'box' clip as shares of the frame height"""
    b=c.get('box') or {};h=max(.05,min(1.0,float(b.get('h',BOX['h']))));y=max(0.0,min(1.0-h,float(b.get('y',BOX['y']))))
    return y,h
def box_px(c,W,H):
    """(top, height) in pixels of a W x H frame; the height is even, as the video filters need"""
    y,h=box_of(c);bh=max(2,int(round(H*h/2))*2);return min(H-bh,int(round(H*y))),bh

def hexcolor(c,opacity=None):
    c=c.lstrip('#');return f'0x{c}'+(f'@{opacity:.2f}' if opacity is not None else '')

def text_scale(w,h):return min(w,h)/1080  # captions are sized for the short side so vertical reels look like horizontal films

def component_geometry(p,w,h,size):
    """One shared card geometry for the editor and FFmpeg preview/export."""
    component=p.get('component','text')
    if component=='text':return None
    vertical=h>w;lines=max(1,len(p.get('text','').splitlines()))
    ratio={'cta':(.72 if vertical else .40),'offer':(.86 if vertical else .58),'stack':(.84 if vertical else .54)}.get(component,.76)
    width=min(w,max(size*5.0,w*ratio))
    factor={'cta':2.25,'offer':lines*1.42+1.8,'stack':lines*1.32+1.55}.get(component,2.4)
    height=max(size*factor,size*2.1)
    x=max(0.0,min(w-width,w*p.get('x',.5)-width/2));y=max(0.0,min(h-height,h*p.get('y',.5)-height/2))
    return {'x':x,'y':y,'w':width,'h':height,'pad':size*.72,'stroke':max(2.0,size*.035),'accent_w':max(5.0,size*.10),'inset':size*.34}

def ramp(e):return min(.15,e['duration']/3)
def env_times(e):
    """(attack, release) seconds of an effect's envelope. A plain zoom ramps in and out; a punch zoom sets a near-instant
    attack, a slow camera push an attack as long as the whole effect, and release 0 means it snaps back on the cut."""
    d=max(e['duration'],1e-6);base=ramp(e) if e['type']=='zoom' else .05
    a=e.get('attack');r=e.get('release')
    a=base if a is None else max(0.0,min(float(a),d))
    r=base if r is None else max(0.0,min(float(r),d-a))
    return a,r
def envelope(e,t):
    s=e['start'];end=s+e['duration']
    if not s<=t<=end:return 0.0
    a,r=env_times(e);k=1.0
    if a>1e-4:k=min(k,(t-s)/a)
    if r>1e-4:k=min(k,(end-t)/r)
    if e['type']=='shake' and e.get('decay'):k*=max(0.0,1-(t-s)/max(e['duration'],1e-6))  # a hit that dies away
    return max(0.0,k)
def shake_px(e):return 24*e.get('amount',1.0)

def transform_at(effects,t,aspect=16/9):
    """(zoom, dx, dy) in 1080p pixels at program time t. A zoom with an anchor (ax, ay: 0..1 of the frame, e.g. a face)
    grows around that point instead of the middle; aspect (width / height of the output) turns it into pixels."""
    z=1.0;dx=dy=0.0;wide=OUT_H*aspect
    for e in effects:
        k=envelope(e,t)
        if not k:continue
        if e['type']=='zoom':
            grow=(e.get('strength',1.3)-1)*k;z+=grow
            dx+=grow*(e.get('ax',.5)-.5)*wide;dy+=grow*(e.get('ay',.5)-.5)*OUT_H
        elif e['type']=='shake':
            a=shake_px(e)*k;dx+=a*math.sin(t*53);dy+=a*math.cos(t*41);z+=2*shake_px(e)*k/OUT_H+.004
    return z,dx,dy

# ------------------------------------------------------------------ virtual camera: a clip reframed onto a face
# A clip may carry 'cam': [[source second, cx, cy, zoom, ease], ...]. (cx, cy) is the point of the source picture (0..1)
# the frame is centred on - as far as the picture reaches, so the crop never shows anything outside it. zoom 1.0 is the
# plain 'cover' fill, 1.3 a closer shot. ease 1: the way to the NEXT key is a smooth camera move; 0: linear (dense keys
# following a moving head). The export (cam_filter) and the editor preview (cam_at) read the same keys.
def cam_keys(c):
    keys=[]
    for k in c.get('cam') or []:
        if len(k)>=4:keys.append([float(k[0]),float(k[1]),float(k[2]),max(1.0,float(k[3])),int(k[4]) if len(k)>4 else 1])
    return sorted(keys)
def cam_at(keys,t):
    """(cx, cy, zoom) at source second t"""
    if not keys:return (.5,.5,1.0)
    if t<=keys[0][0]:return tuple(keys[0][1:4])
    for a,b in zip(keys,keys[1:]):
        if t<=b[0]:
            k=(t-a[0])/max(b[0]-a[0],1e-6)
            if a[4]:k=k*k*(3-2*k)
            return tuple(a[i]+(b[i]-a[i])*k for i in (1,2,3))
    return tuple(keys[-1][1:4])
def cam_expr(keys,i,T):
    """FFmpeg expression of cx (i=1), cy (2) or zoom (3) over time T - the same curve as cam_at"""
    expr=f'{keys[-1][i]:.5f}'
    for a,b in reversed(list(zip(keys,keys[1:]))):
        if abs(b[i]-a[i])<1e-6:seg=f'{a[i]:.5f}'
        else:
            k=f'(({T})-{a[0]:.4f})/{max(b[0]-a[0],1e-6):.4f}'
            if a[4]:k=f'({k})*({k})*(3-2*({k}))'
            seg=f'{a[i]:.5f}+({b[i]-a[i]:.5f})*{k}'
        expr=f'if(lt({T},{b[0]:.4f}),{seg},{expr})'
    return f'if(lt({T},{keys[0][0]:.4f}),{keys[0][i]:.5f},{expr})'
def cam_filter(keys,W,H,w0,h0,t0=0.0):
    """crop that follows the keys, then scaled to W x H. The crop window is cut straight from the source (cheap), and only
    when the zoom changes over the clip is the picture scaled frame by frame and cropped once more around the subject.
    t0: the source second at which the filter's own clock starts."""
    T=f't+{t0:.4f}' if t0 else 't';s=max(W/w0,H/h0);zs=[k[3] for k in keys];zmin=min(zs)
    cw=min(w0,max(2,2*round(W/(s*zmin)/2)));ch=min(h0,max(2,2*round(H/(s*zmin)/2)))
    CX=cam_expr(keys,1,T);CY=cam_expr(keys,2,T)
    X1=f'max(0,min({w0-cw},({CX})*{w0}-{cw/2:.2f}))';Y1=f'max(0,min({h0-ch},({CY})*{h0}-{ch/2:.2f}))'
    out=f"crop=w={cw}:h={ch}:x='{X1}':y='{Y1}'"
    if max(zs)-zmin<1e-3:return out+f',scale={W}:{H}:flags=lanczos'
    Z=cam_expr(keys,3,T)
    # max(): W*z/zmin at z == zmin is W in exact arithmetic but 539.9999 in floating point, and a picture one pixel short
    # of W x H would break the crop after it
    SW=f'max({W},2*trunc({W}*({Z})/{zmin:.5f}/2+0.001))';SH=f'max({H},2*trunc({H}*({Z})/{zmin:.5f}/2+0.001))'
    out+=f",scale=w='{SW}':h='{SH}':eval=frame"
    PX=f'(({CX})*{w0}-({X1}))/{cw}';PY=f'(({CY})*{h0}-({Y1}))/{ch}'
    # the crop's own iw/ih keep the size of the FIRST frame when the scale changes it frame by frame, so the picture's
    # size is written out here again - with iw/ih every zoom grew from the top-left corner instead of the subject
    return out+f",crop={W}:{H}:x='max(0,min({SW}-{W},({PX})*{SW}-{W/2:.1f}))':y='max(0,min({SH}-{H},({PY})*{SH}-{H/2:.1f}))'"
def cam_view(cx,cy,z,fw,fh,aspect):
    """editor preview of the camera: (shift x, shift y) in preview pixels for a picture drawn to cover fw x fh and zoomed
    z times around the frame centre, so that (cx, cy) lands in the middle as far as the picture reaches"""
    dw,dh=(max(fw,fh*aspect),max(fh,fw/aspect)) if aspect else (fw,fh)
    sx=-z*(cx-.5)*dw;sy=-z*(cy-.5)*dh;mx=max(0.0,z*dw/2-fw/2);my=max(0.0,z*dh/2-fh/2)
    return max(-mx,min(mx,sx)),max(-my,min(my,sy))

# ------------------------------------------------------------------ text and stickers that follow something on screen
# 'track': [[seconds after the effect starts, x, y], ...] (0..1 of the frame); between the points the position is linear.
def track_at(e,t):
    pts=e.get('track') or []
    if not pts:return e.get('x',.5),e.get('y',.5)
    k=t-e['start']
    if k<=pts[0][0]:return pts[0][1],pts[0][2]
    for a,b in zip(pts,pts[1:]):
        if k<=b[0]:
            f=(k-a[0])/max(b[0]-a[0],1e-6);return a[1]+(b[1]-a[1])*f,a[2]+(b[2]-a[2])*f
    return pts[-1][1],pts[-1][2]
def track_expr(e,i):
    """FFmpeg expression (programme time t) of x (i=1) or y (i=2); a constant without a track"""
    pts=e.get('track') or []
    if not pts:return f"{e.get('x' if i==1 else 'y',.5):.4f}"
    s=e['start'];T=f'(t-{s:.3f})';expr=f'{pts[-1][i]:.4f}'
    for a,b in reversed(list(zip(pts,pts[1:]))):
        expr=f'if(lt({T},{b[0]:.3f}),{a[i]:.4f}+({b[i]-a[i]:.4f})*({T}-{a[0]:.3f})/{max(b[0]-a[0],1e-6):.3f},{expr})'
    return f'if(lt({T},{pts[0][0]:.3f}),{pts[0][i]:.4f},{expr})'
def shift_track(e,dx,dy):
    """dragging tracked text on the preview moves the whole path, so it keeps following its subject"""
    for p in e.get('track') or []:p[1]=round(max(0.0,min(1.0,p[1]+dx)),4);p[2]=round(max(0.0,min(1.0,p[2]+dy)),4)

# ------------------------------------------------------------------ key words drawn bigger in speech subtitles
EMPH_COLOR='#ffe600';EMPH_SCALE=1.28
def norm_word(w):return re.sub(r"[^\w']",'',str(w)).upper()
def emphasised(e):
    """set of normalised words this subtitle draws bigger and in the accent colour"""
    return {norm_word(w) for w in e.get('emph') or [] if norm_word(w)}
def flash_at(effects,t):
    return max([1-(t-e['start'])/e['duration'] for e in effects if e['type']=='flash' and e['start']<=t<e['start']+e['duration']],default=0.0)
def gain_at(effects,t):
    return math.prod(10**(e.get('db',6.0)*envelope(e,t)/20) for e in effects if e['type']=='boost')

MAX_GAIN=2.0  # top of a volume curve = 200 %

def env_gain(env,t):
    """volume curve: [[source_time, gain], ...] sorted; linear between points, flat outside"""
    if not env:return 1.0
    if t<=env[0][0]:return env[0][1]
    for (t0,g0),(t1,g1) in zip(env,env[1:]):
        if t<=t1:return g0+(g1-g0)*(t-t0)/max(t1-t0,1e-6)
    return env[-1][1]

def env_filter(env,src_in,speed=1.0):
    """FFmpeg volume filter for a curve; the filter's t starts at 0 where the item starts playing (source time
    src_in) and runs at programme pace, so a clip's own rate squeezes the curve along with the sound"""
    if not env:return ''
    speed=speed or 1.0
    pts=[((t-src_in)/speed,g) for t,g in env]
    expr=f'{pts[-1][1]:.4f}'
    for (t0,g0),(t1,g1) in reversed(list(zip(pts,pts[1:]))):
        expr=f'if(lt(t,{t1:.3f}),{g0:.4f}+({g1-g0:.4f})*(t-({t0:.3f}))/{max(t1-t0,1e-6):.4f},{expr})'
    return f",volume='if(lt(t,{pts[0][0]:.3f}),{pts[0][1]:.4f},{expr})':eval=frame"

def _env_expr(e):
    """envelope() as an FFmpeg expression"""
    s=e['start'];end=s+e['duration'];a,r=env_times(e)
    up=f'(t-{s:.3f})/{a:.3f}' if a>1e-4 else '1';down=f'({end:.3f}-t)/{r:.3f}' if r>1e-4 else '1'
    k=f'min(1,min({up},{down}))'
    if e['type']=='shake' and e.get('decay'):k=f'{k}*max(0,1-(t-{s:.3f})/{max(e["duration"],1e-6):.3f})'
    return f'if(between(t,{s:.3f},{end:.3f}),max(0,{k}),0)'
def transform_filter(effects,w,h):
    """scale per frame + fixed-size crop; mirrors transform_at. None when no zoom/shake is used."""
    moves=[e for e in effects if e['type'] in ('zoom','shake')]
    if not moves:return None
    z=['1'];dx=['0'];dy=['0'];k=h/OUT_H
    for e in moves:
        env=_env_expr(e)
        if e['type']=='zoom':
            grow=e.get('strength',1.3)-1;z.append(f"{grow:.4f}*{env}")
            ax=e.get('ax',.5)-.5;ay=e.get('ay',.5)-.5
            if abs(ax)>1e-3:dx.append(f'{grow*ax*w:.2f}*{env}')
            if abs(ay)>1e-3:dy.append(f'{grow*ay*h:.2f}*{env}')
        else:
            a=shake_px(e);z.append(f'{2*a/OUT_H+.004:.5f}*{env}');dx.append(f'{a*k:.2f}*{env}*sin(t*53)');dy.append(f'{a*k:.2f}*{env}*cos(t*41)')
    Z='+'.join(z);DX='+'.join(dx);DY='+'.join(dy)
    # the crop's iw/ih stay at the first frame's size while the scale changes it frame by frame: the scaled size is
    # written out again, or every zoom grows from the top-left corner instead of its anchor (the preview's centre)
    SW=f'trunc({w}*({Z})/2)*2';SH=f'trunc({h}*({Z})/2)*2'
    return (f"scale=w='{SW}':h='{SH}':eval=frame,"
            f"crop={w}:{h}:x='max(0,min({SW}-{w},({SW}-{w})/2+({DX})))':y='max(0,min({SH}-{h},({SH}-{h})/2+({DY})))'")

def text_y(position,h):
    return {'top':f'{int(h*.08)}','middle':'(h-text_h)/2','bottom':f'h-text_h-{int(h*.1)}'}.get(position,'(h-text_h)/2')

def escape_path(p):return str(p).replace('\\','/').replace(':','\\:').replace("'","\\'")

def run(args):
    p=subprocess.run(args,capture_output=True,creationflags=subprocess.CREATE_NO_WINDOW)
    if p.returncode:raise RuntimeError('FFmpeg: '+p.stderr.decode('utf-8','replace').strip()[-400:])

def make_title(ffmpeg,folder,text='A few moments later...',duration=2.5,bg='#6b3f12',color='#ffe14d',w=1920,h=1080,fps=30):
    """Renders a SpongeBob-style title card once and caches it by content."""
    key=hashlib.sha1(f'{text}|{duration}|{bg}|{color}|{w}x{h}@{fps}'.encode()).hexdigest()[:12]
    out=pathlib.Path(folder)/f'plansza-{key}.mp4'
    if out.exists():return out
    out.parent.mkdir(parents=True,exist_ok=True)
    with tempfile.NamedTemporaryFile('w',suffix='.txt',delete=False,encoding='utf-8') as f:f.write(text)
    try:
        base=min(w*.085,h*.15)  # the width limits vertical cards, the height limits horizontal ones
        size=int(base) if len(text)<=26 else int(base*26/len(text))
        vf=(f"drawtext=fontfile='{escape_path(FONT)}':textfile='{escape_path(f.name)}':expansion=none:fontsize={size}:fontcolor={color}:borderw={max(4,size//14)}:bordercolor=black:"
            f"shadowx=6:shadowy=6:shadowcolor=black@0.6:x=(w-text_w)/2:y=(h-text_h)/2,vignette=PI/5,fade=t=in:d=0.2,fade=t=out:st={max(0,duration-.2):.2f}:d=0.2")
        tmp=out.with_suffix('.part.mp4')
        run([str(ffmpeg),'-v','error','-y','-f','lavfi','-i',f'color=c={bg}:s={w}x{h}:r={fps}:d={duration}','-f','lavfi','-i','anullsrc=r=48000:cl=stereo',
             '-vf',vf,'-t',str(duration),'-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-shortest',str(tmp)])
        os.replace(tmp,out)
    finally:os.unlink(f.name)
    return out

BUILTIN_SOUNDS={
    'whoosh.wav':"anoisesrc=d=0.7:c=pink:a=0.7,highpass=f=500,lowpass=f=4000,afade=t=in:d=0.35:curve=exp,afade=t=out:st=0.35:d=0.35",
    'boom.wav':"aevalsrc='0.95*sin(2*PI*(70-45*t)*t)*exp(-3.2*t)|0.95*sin(2*PI*(70-45*t)*t)*exp(-3.2*t)':d=1.4:s=48000",
    'pop.wav':"aevalsrc='0.8*sin(2*PI*(1100-3000*t)*t)*exp(-35*t)|0.8*sin(2*PI*(1100-3000*t)*t)*exp(-35*t)':d=0.25:s=48000",
    'ding.wav':"aevalsrc='0.45*sin(2*PI*1320*t)*exp(-3.5*t)+0.25*sin(2*PI*2640*t)*exp(-6*t)|0.45*sin(2*PI*1320*t)*exp(-3.5*t)+0.25*sin(2*PI*2640*t)*exp(-6*t)':d=1.5:s=48000",
    'riser.wav':"aevalsrc='0.35*sin(2*PI*(200*t+300*t*t))*t/1.5|0.35*sin(2*PI*(200*t+300*t*t))*t/1.5':d=1.5:s=48000,afade=t=out:st=1.4:d=0.1",
}
def ensure_builtin_sounds(ffmpeg,folder):
    folder=pathlib.Path(folder);folder.mkdir(parents=True,exist_ok=True)
    for name,src in BUILTIN_SOUNDS.items():
        target=folder/name
        if not target.exists():
            try:run([str(ffmpeg),'-v','error','-y','-f','lavfi','-i',src,'-ar','48000','-ac','2',str(target)])
            except RuntimeError:pass
