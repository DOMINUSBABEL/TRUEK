from playwright.sync_api import sync_playwright
import os
import glob

def run_cuj(page):
    # Navigate directly to the Add Item page using hash routing
    page.goto("http://localhost:4173/#/add")
    page.wait_for_timeout(1000)

    # Injecting Tailwind class via Javascript for visual confirmation since focus-visible needs keyboard interaction
    # Using Tab to navigate to trigger focus-visible styles on the modified inputs
    page.keyboard.press('Tab')
    page.wait_for_timeout(300)
    page.keyboard.press('Tab')
    page.wait_for_timeout(300)

    # Take screenshot of the Add Item form with new labels
    page.screenshot(path="/home/jules/verification/screenshots/verification.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    # Clean up old videos
    for f in glob.glob("/home/jules/verification/videos/*.webm"):
        os.remove(f)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()  # MUST close context to save the video
            browser.close()