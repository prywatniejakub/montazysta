r"""Lista polskich głosów z biblioteki ElevenLabs + stan kredytów.  ..\..\..\runtime\python.exe glosy.py [male|female]"""
import os, sys, json, urllib.parse
sys.path[:0] = [((__import__("os").environ.get("C4Y_ROOT") or __import__("os").path.expanduser("~/Montaz/studio")) + "/app/vendor"), ((__import__("os").environ.get("C4Y_ROOT") or __import__("os").path.expanduser("~/Montaz/studio")) + "/app")]
import dubbing as D
sys.stdout.reconfigure(encoding="utf-8")
el = D.ElevenLabs(D.secrets().get("elevenlabs_api_key"))
data, _ = el.request("GET", "/v1/user/subscription", None, {})
s = json.loads(data); print("kredyty:", s.get("character_count"), "/", s.get("character_limit"))
g = sys.argv[1] if len(sys.argv) > 1 else "male"
q = urllib.parse.urlencode({"language": "pl", "gender": g, "page_size": 40, "sort": "usage_character_count_1y"})
data, _ = el.request("GET", "/v1/shared-voices?" + q, None, {})
for v in json.loads(data).get("voices", []):
    print(f"{v['voice_id']} | {v.get('name')} | {v.get('age')} | {v.get('use_case')} | {v.get('descriptive')} | {(v.get('description') or '')[:90]}")
