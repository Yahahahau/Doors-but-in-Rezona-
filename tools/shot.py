import asyncio, sys, json
from playwright.async_api import async_playwright
URL = sys.argv[1]
OUT = sys.argv[2]
W = int(sys.argv[3]); H = int(sys.argv[4])
script = json.loads(sys.argv[5]) if len(sys.argv) > 5 else []
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--autoplay-policy=no-user-gesture-required','--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width':W,'height':H}, device_scale_factor=1)
        logs=[]
        pg.on('console', lambda m: logs.append(f'{m.type}: {m.text}'))
        pg.on('pageerror', lambda e: logs.append(f'PAGEERROR: {e}'))
        await pg.goto(URL)
        n=0
        for step in script:
            k=step[0]
            if k=='wait': await pg.wait_for_timeout(step[1])
            elif k=='down': await pg.keyboard.down(step[1])
            elif k=='up': await pg.keyboard.up(step[1])
            elif k=='press': await pg.keyboard.press(step[1])
            elif k=='click': await pg.click(step[1])
            elif k=='eval': r=await pg.evaluate(step[1]); logs.append('EVAL: '+json.dumps(r)[:600])
            elif k=='hold':
                bb=await pg.locator(step[1]).bounding_box()
                await pg.mouse.move(bb['x']+bb['width']/2, bb['y']+bb['height']/2)
                await pg.mouse.down(); await pg.wait_for_timeout(step[2]); await pg.mouse.up()
            elif k=='shot':
                await pg.screenshot(path=f'{OUT}_{step[1]}.png'); n+=1
        await pg.screenshot(path=f'{OUT}.png')
        print('\n'.join(logs[-40:]))
        await b.close()
asyncio.run(main())
