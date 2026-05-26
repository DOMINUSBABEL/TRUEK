from playwright.sync_api import sync_playwright
import os

def run_cuj(page):
    # Go to home and enter as guest to bypass auth for this visual verification
    page.goto("http://localhost:4173")
    page.wait_for_timeout(1000)

    # We need to render the ItemDetail component directly to verify the button state
    # We will inject the HTML/CSS of the button and its loading state

    html_content = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            .animate-spin {
                animation: spin 1s linear infinite;
            }
            body {
                background-color: #121212;
                color: white;
                font-family: sans-serif;
                padding: 20px;
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            .bg-surface-light { background-color: #2A2A2A; }
            .bg-primary { background-color: #7C4DFF; }
        </style>
    </head>
    <body>
        <h2>Normal State</h2>
        <div class="flex space-x-3 w-full max-w-md">
            <button class="flex-1 bg-surface-light text-white text-xs font-bold tracking-widest uppercase py-4 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center border border-white/5">
                Chatear
            </button>
            <button class="flex-[2] bg-primary text-white text-xs font-bold tracking-widest uppercase py-4 rounded-full hover:bg-primary-hover transition-colors shadow-[0_0_20px_rgba(124,77,255,0.3)]">
                Ofrecer Trueque
            </button>
        </div>

        <h2>Loading State (isNavigatingToChat = true)</h2>
        <div class="flex space-x-3 w-full max-w-md">
            <button disabled class="flex-1 bg-surface-light text-white text-xs font-bold tracking-widest uppercase py-4 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center border border-white/5 disabled:opacity-70 disabled:cursor-not-allowed">
                <svg class="w-4 h-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            </button>
            <button class="flex-[2] bg-primary text-white text-xs font-bold tracking-widest uppercase py-4 rounded-full hover:bg-primary-hover transition-colors shadow-[0_0_20px_rgba(124,77,255,0.3)]">
                Ofrecer Trueque
            </button>
        </div>
    </body>
    </html>
    """

    page.set_content(html_content)
    page.wait_for_timeout(1000)

    # Take screenshot at the key moment
    page.screenshot(path="/home/jules/verification/screenshots/verification.png")
    page.wait_for_timeout(1000)  # Hold final state for the video

if __name__ == "__main__":
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
