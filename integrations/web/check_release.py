"""Run local regression checks. Never submits public-chain transactions.

Requires Node, Playwright with Chrome, and contracts/node_modules for mint tests.
Use NODE_PATH when Playwright is supplied by an external development runtime.
"""
import argparse
import concurrent.futures
import json
from pathlib import Path
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[2]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--match', default='', help='Only test paths containing this text')
parser.add_argument('--jobs', type=int, choices=[1, 2], default=2)
args = parser.parse_args()
tests = [(str(p.relative_to(ROOT)), ['node', str(p)]) for p in sorted((ROOT/'output/selection').rglob('*.test.cjs'))]
for name in ['output/selection/check-character-lessons.cjs', 'output/selection/check-character-lessons-tr.cjs', 'output/selection/check-diren-quiz.cjs', 'output/selection/check-nft.cjs', 'integrations/web/home.test.cjs'] + sorted(str(p.relative_to(ROOT)) for p in (ROOT/'contracts/test').glob('*.cjs')):
    tests.append((name, ['node', str(ROOT/name)]))
tests.append(('hosted-services', [sys.executable, '-m', 'unittest', 'integrations.hosted.test_service', 'integrations.hosted.test_protection']))
tests = [(name, cmd) for name, cmd in tests if args.match in name]
if not tests:
    parser.error('No matching checks')

def run(item):
    name, command = item
    try:
        result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True, timeout=150)
        code, output = result.returncode, result.stdout + result.stderr
    except subprocess.TimeoutExpired:
        code, output = 124, 'Timed out after 150 seconds.'
    print(('PASS ' if code == 0 else 'FAIL ') + name, flush=True)
    return {'test': name, 'code': code, 'output': output}

with concurrent.futures.ThreadPoolExecutor(max_workers=args.jobs) as pool:
    results = list(pool.map(run, tests))
with tempfile.NamedTemporaryFile(mode='w', prefix='resonance-checks-', suffix='.json', delete=False) as report:
    json.dump(results, report, indent=2)
print(f"{sum(r['code'] == 0 for r in results)}/{len(results)} passed. Report: {report.name}")
sys.exit(any(r['code'] != 0 for r in results))
