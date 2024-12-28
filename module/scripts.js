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
            <div class="container" id="content">
                <div class="post home-content">
                    <img src="/module/favicon.png" alt="Website Logo">
                    <p>This website is currently under construction... </p>
                    <a class="github-btn" href="https://github.com/Weedy233/Weedy233.github.io" target="_blank">
                        <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub Logo"> View on GitHub
                    </a>
                </div>
            </div>
            `;
            break;
        default:
            html = '<div class="post"><h2>Section Not Found</h2><p>The section you are looking for does not exist.</p></div>';
    }
    content.innerHTML = html;
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
            // 使用 Marked 渲染 Markdown 为 HTML
            const html = marked.parse(readmeContent);
            content.innerHTML = `
                <div class="markdown-content">
                    ${html}
                </div>`;
        })
        .catch(error => {
            content.innerHTML = `<p>Error: ${error.message}</p>`;
        });
}
