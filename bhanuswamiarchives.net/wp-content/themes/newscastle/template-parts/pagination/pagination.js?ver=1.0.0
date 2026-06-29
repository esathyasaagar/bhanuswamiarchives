document.addEventListener('DOMContentLoaded', function () {
    const loadButtonWrapper = document.querySelector('.newscastle-advanced-pagination');

    if (!loadButtonWrapper) return;

    const loadButton = loadButtonWrapper.querySelector('.newscastle-ajax-load-button');
    const loader = loadButtonWrapper.querySelector('.newscastle-pagination-spinner');
    const postsListWrapper = document.querySelector('.article-groups');

    if (!loadButton || !loader || !postsListWrapper) {
        console.error('Required elements not found.');
        return;
    }

    let currentPage = parseInt(loadButtonWrapper.getAttribute('data-page'), 10);
    const maxPages = parseInt(loadButtonWrapper.getAttribute('data-max-pages'), 10);
    const loadType = loadButtonWrapper.getAttribute('data-load-type') || 'pagination_ajax_on_click';

    if (isNaN(currentPage) || isNaN(maxPages)) {
        console.error('Invalid pagination attributes.');
        return;
    }

    const fetchThePosts = () => {
        if (currentPage >= maxPages) {
            console.error('No more pages to load.');
            return;
        }

        loadButton.classList.add('loading');
        loader.classList.add('active');

        const data = {
            action: 'newscastle_load_posts',
            nonce: NewscastleVars.load_post_nonce_wp,
            query_vars: NewscastleVars.query_vars,
            page: currentPage + 1,
            post_type: 'post' // Adjust this if you're loading a different post type
        };

        fetch(NewscastleVars.ajaxurl, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: new URLSearchParams(data)
        })
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.json();
            })
            .then(response => {
                if (response.success) {
                    const content = response.data.content.join('');
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = content;
                    while (tempDiv.firstChild) {
                        postsListWrapper.appendChild(tempDiv.firstChild);
                    }

                    currentPage++;
                    loadButtonWrapper.setAttribute('data-page', currentPage);

                    if (currentPage >= maxPages) {
                        loadButtonWrapper.style.display = 'none';
                    }

                    document.body.dispatchEvent(new Event('posts-loaded'));
                } else {
                    console.error('Failed to load posts:', response.data);
                }
            })
            .catch(error => {
                console.error('Error during fetch:', error);
            })
            .finally(() => {
                loadButton.classList.remove('loading');
                loader.classList.remove('active');
            });
    };

    const debounce = (func, wait) => {
        let timeout;
        return function (...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    if (loadType === 'pagination_ajax_on_click') {
        loadButton.addEventListener('click', function (event) {
            event.preventDefault();
            fetchThePosts();
        });
    } else if (loadType === 'pagination_ajax_on_scroll') {
        const handleScroll = debounce(function () {
            const btnPosition = loadButtonWrapper.getBoundingClientRect().top;
            const isBtnVisible = btnPosition - window.innerHeight <= 400;
            if (currentPage < maxPages && isBtnVisible) {
                fetchThePosts();
            }
        }, 200);

        window.addEventListener('scroll', handleScroll);
    }
});
