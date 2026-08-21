import sys, json
raw = sys.stdin.read()
for line in raw.strip().split('\n'):
    if line.startswith('data: '):
        data = json.loads(line[6:])
        result = json.loads(data['result']['content'][0]['text'])
        wf = result.get('workflow', result)
        print('Connections:')
        print(json.dumps(wf.get('connections', {}), indent=2))
        print()
        print('Node names:')
        for n in wf.get('nodes', []):
            print(f'  {n["name"]}: {n["type"]} (v{n.get("typeVersion", "?")})')
