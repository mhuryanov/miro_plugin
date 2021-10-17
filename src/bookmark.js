function addBookmarkList(bookmark) {
    $('#bookmarkList').append(`
        <li class="menu-item" title="${bookmark.name}">
            <a href="#" onclick='moveToBookmark(${bookmark.id})'>
                <div class="word-name">${bookmark.name}</div>
                &nbsp;
            </a>
            <div class="action">
                <button class="btn button-icon button-icon-small icon-photo" title="Update with current view" onclick='updateBookmark(${bookmark.id})'></button>
                <button class="btn button-icon button-icon-small icon-trash" title="Remove" onclick='removeBookmark(${bookmark.id})'></button>
            </div>
        </li>
    `);
}

function loadBookmarksToList() {
    toggleLoading();
    getBookmarks().then((bookmarks) => {
        $('#bookmarkList').html('');
        bookmarks.forEach((bookmark) => {
            addBookmarkList(bookmark);
        });
        toggleLoading(false);
    });
}

async function getBookmarkById(bookmarkId) {
    var bookmarks = await getBookmarks();
    var bookmarkIndex = bookmarks.findIndex((item) => item.id == bookmarkId);
    return bookmarks[bookmarkIndex];
}

async function moveToBookmark(bookmarkId) {
    toggleLoading(true);

    var bookmark = await getBookmarkById(bookmarkId);
    var oldTags = await getTags();
    var oldStickies = await getStickies();

    await miro.board.tags.delete(oldTags.map((item) => item.id));
    await miro.board.widgets.deleteById(oldStickies.map((item) => item.id));

    await miro.board.tags.create(bookmark.tags);
    await miro.board.widgets.create(bookmark.widgets);

    toggleLoading(false);
}

async function updateBookmark(bookmarkId) {
    toggleLoading(true);

    var stickies = await getStickies();
    var tags = await getTags();
    var bookmark = await getBookmarkById(bookmarkId);

    miro.board.metadata.get().then(async (metadata) => {
        var index = metadata[appId].bookmarks.findIndex((item) => item.id == bookmark.id);

        if (index > -1) {
            metadata[appId].bookmarks[index].stickies = stickies;
            metadata[appId].bookmarks[index].tags = tags;
        }

        await miro.board.metadata.update({
            [appId]: {
                ...metadata[appId],
            },
        });

        toggleLoading(false);
        loadBookmarksToList();
    });
}

function removeBookmark(bookmarkId) {
    toggleLoading(true);

    miro.board.metadata.get().then(async (metadata) => {
        var index = metadata[appId].bookmarks.findIndex((item) => item.id == bookmarkId);

        if (index > -1) {
            metadata[appId].bookmarks.splice(index, 1);
        }

        await miro.board.metadata.update({
            [appId]: {
                ...metadata[appId],
            },
        });

        toggleLoading(false);
        loadBookmarksToList();
    });
}

$('#addBookmark').on('click', async () => {
    toggleLoading(true);

    await miro.board.metadata.update({
        [appId]: {
            focusedBookmarkName: 'Bookmark',
        },
    });

    var stickies = await getStickies();
    var tags = await getTags();

    miro.board.ui.openModal('setBookmarkNameModal.html', { width: 400, height: 300 }).then(() => {
        miro.board.metadata.get().then(async (metadata) => {
            if (metadata[appId].focusedBookmarkName) {
                if (!metadata[appId].bookmarks) metadata[appId].bookmarks = [];

                metadata[appId].bookmarks.push({
                    id: randomId(),
                    stickies,
                    tags,
                });

                await miro.board.metadata.update({
                    [appId]: {
                        ...metadata[appId],
                    },
                });

                toggleLoading(false);
                loadBookmarksToList();
            }
        });
    });
});
