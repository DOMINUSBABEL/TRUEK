from playwright.sync_api import sync_playwright
import os

def run_cuj(page):
    print("Navigating to Add Item page...")
    page.goto("http://localhost:4173/#/add")
    page.wait_for_timeout(1500)

    print("Emulating keyboard navigation to test focus states on labels and inputs...")
    page.keyboard.press('Tab')
    page.wait_for_timeout(500)
    page.keyboard.press('Tab')
    page.wait_for_timeout(500)

    print("Taking screenshot...")
    page.screenshot(path="/home/jules/verification/screenshots/verification.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    os.makedirs("/home/jules/verification/videos", exist_ok=True)
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
