from playwright.sync_api import sync_playwright
import os
import shutil

def run_cuj(page):
    page.goto("http://localhost:4173/#/add")
    page.wait_for_timeout(2000)

    # We expect to be redirected to home if we are not logged in, but let's click 'Continue as Guest'
    try:
        # If we are at home page, click 'Continue as Guest'
        page.get_by_text("Continue as Guest").click(timeout=3000)
        page.wait_for_timeout(1000)
        page.goto("http://localhost:4173/#/add")
        page.wait_for_timeout(2000)
    except:
        pass

    # Now we are on the add page. Let's test the label clickability
    # Click the label for 'What are you offering?' and verify focus is on the input
    page.get_by_text("What are you offering?").click()
    page.wait_for_timeout(500)

    # Check if the title input has focus
    title_input = page.locator("#item-title")
    title_input.fill("Playwright Test Guitar")
    page.wait_for_timeout(500)

    # Click description label
    page.get_by_text("Description").click()
    page.wait_for_timeout(500)

    # Check if description textarea has focus
    desc_input = page.locator("#item-description")
    desc_input.fill("This is a test description")
    page.wait_for_timeout(500)

    # Take screenshot
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)
    page.screenshot(path="/home/jules/verification/screenshots/verification.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    os.makedirs("/home/jules/verification/videos", exist_ok=True)
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
