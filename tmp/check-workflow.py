import sys, json
raw = sys.stdin.read()
for line in raw.strip().split('\n'):
    if line.startswith('data: '):
        data = json.loads(line[6:])
        result = json.loads(data['result']['content'][0]['text'])
        wf = result.get('workflow', result)
        for n in wf.get('nodes', []):
            name = n['name']
            ntype = n['type']
            creds = n.get('credentials', {})
            params = n.get('parameters', {})
            print(f"Node: {name} ({ntype})")
            print(f"  Credentials: {json.dumps(creds) if creds else 'none'}")
            if 'model' in params:
                print(f"  Model: {json.dumps(params['model'])}")
            if 'agent' in params:
                agent = params['agent']
                if isinstance(agent, str):
                    print(f"  Agent type: {agent}")
                elif isinstance(agent, dict):
                    print(f"  Agent type: {agent.get('agentType', '?')}")
            print()
