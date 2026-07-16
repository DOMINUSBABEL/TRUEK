import time
from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Set viewport to mobile size to match design
        page.set_viewport_size({"width": 375, "height": 812})

        page.goto('http://localhost:4173')
        page.wait_for_selector('text=Continue as Guest')
        page.click('text=Continue as Guest')

        time.sleep(1) # wait for redirect

        # Navigate directly to the AddItem route
        page.goto('http://localhost:4173/#/add')

        # Wait for the form to render
        page.wait_for_selector('text=Publish Asset')
        time.sleep(1)

        # Verify focus style by explicitly clicking the label
        page.click('text=What are you offering?')
        time.sleep(1) # Wait for focus visual state

        # Scroll down slightly to make sure input is clearly visible
        page.evaluate("window.scrollBy(0, 100)")
        time.sleep(0.5)

        # Take a screenshot
        page.screenshot(path="add_item_focus.png")

        browser.close()

if __name__ == "__main__":
    verify()
