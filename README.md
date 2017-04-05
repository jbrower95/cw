# cw
The content-warning chrome plugin
------

Layout:

1. The little popup in the corner of chrome (the plugin 'action') is in 'popup.html' / 'popup.js'.
2. The script which is executed on every fb page is in content.js (see also the scripts that content.js relies on).

Contributing:

1. popup.html is styled horribly and uses inline css.
2. you should be able to remove individual cw's without removing all of them (add an 'x' button into the <li>'s created).
3. speed optimizations (all are welcome this code is a nightmare).
4. animations for blurring / unblurring? Right now it's choppy as hell.
5. Crypto / security -- maybe store words as hashes w/ salt derived from a user pin code, and then authenticate user once to activate the plugin.
I'm sure you could come up with a scheme where there is not a list of cw's sitting unencrypted in the user's local storage.

LICENSE: MIT
