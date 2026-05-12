import time
from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Connect to dev server
        page.goto("http://localhost:4173/#/")
        time.sleep(1)

        # Click Continue as Guest to bypass auth
        guest_btn = page.get_by_role("button", name="Continue as Guest", exact=False)
        if guest_btn.is_visible():
             guest_btn.click()
             time.sleep(1)

        # Go to challenge page
        page.goto("http://localhost:4173/#/challenge")
        time.sleep(2)

        # Try to trigger the challenge modal and check focus
        page.screenshot(path="challenge.png")
        print("Screenshot saved to challenge.png")

        # Close everything
        context.close()
        browser.close()

if __name__ == "__main__":
    verify()
