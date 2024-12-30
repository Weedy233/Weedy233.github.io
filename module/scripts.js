function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('collapsed');
}

function navigateTo(section) {
    const content = document.getElementById('content');
    let html = '';

    switch (section) {
        case 'home':
            html = `
            <div class="post home-content">
                <img src="module/favicon.png" alt="Website Logo">
                <p>This website is currently under construction... </p>
                <a class="github-btn" href="https://github.com/Weedy233/Weedy233.github.io" target="_blank">
                    <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub Logo"> View on GitHub
                </a>
            </div>`;
            break;

        case 'contact':
            html = `
            <div class="post">
                <h2>Contact</h2>
                <div class="link">
                    <img src="https://www.bilibili.com/favicon.ico" alt="Bilibili Icon">
                    <a href="https://space.bilibili.com/302448919" target="_blank">Visit My Bilibili Homepage</a>
                </div>
                <div class="link">
                    <img src="https://github.githubassets.com/favicons/favicon.svg" alt="GitHub Icon">
                    <a href="https://github.com/Weedy233" target="_blank">Visit My GitHub Homepage</a>
                </div>
            </div>`;
            break;

        default:
            html = '<div class="post"><h2>Section Not Found</h2><p>The section you are looking for does not exist.</p></div>';
            break;
    }


    content.innerHTML = html;

    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`btn-${section}`);
    if (activeBtn) activeBtn.classList.add('active');
}

function showReadme() {
    const content = document.getElementById('content');
    fetch('README.md')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch README.md');
            }
            return response.text();
        })
        .then(readmeContent => {
            const html = marked.parse(readmeContent);
            content.innerHTML = `
                <div class="markdown-content">
                    ${html}
                </div>`;
        })
        .catch(error => {
            content.innerHTML = `<p>Error loading README.md: ${error.message}. Please ensure the file exists and is accessible.</p>`;
        });
}
