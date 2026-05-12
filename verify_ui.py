import time
from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(record_video_dir="videos/")
        page = context.new_page()

        # Try to connect to the dev server
        connected = False
        for _ in range(10):
            try:
                page.goto("http://localhost:4173")
                connected = True
                break
            except Exception:
                time.sleep(1)

        if not connected:
            print("Failed to connect to dev server")
            return

        # Navigate to trades (login as guest first)
        page.goto("http://localhost:4173/#/")
        time.sleep(1)

        # Click Continue as Guest to bypass auth
        guest_btn = page.get_by_role("button", name="Continue as Guest", exact=False)
        if guest_btn.is_visible():
             guest_btn.click()
             time.sleep(1)

        # Go to trades page
        page.goto("http://localhost:4173/#/trades")
        time.sleep(2)

        # Tab to check focus styling on the Chat button
        page.keyboard.press('Tab')
        page.keyboard.press('Tab')
        page.keyboard.press('Tab')

        page.screenshot(path="trades_focus.png")
        print("Screenshot saved to trades_focus.png")

        # Close everything
        context.close()
        browser.close()

if __name__ == "__main__":
    verify()
