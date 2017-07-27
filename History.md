Major Revisions
===============

1.3.0 / 2017-07-26
------------------

- Added support for Recast.ai services


1.2.0 / 2016-12-19
------------------

- Added support for IBM Watson Tone Analyzer service


1.0.0 / 2016-11-06
------------------

- Breaking changes to wit interface. 
  - The wit message service is now accessible at `require('wit/message')` so change `require('wit')` to `require('wit/message')` after upgrade.
- Added `wit.converse` or `require('wit/converse')`
- Removed deprecated `wit.message`
- Removed deprecated `conversation.message`


0.2.1 / 2016-11-05
------------------

- Modernise conversation and wit services. Further simplify their interface
  - deprecate usage of `wit.message()`, instead use `wit()` directly.
  - deprecate usage of `conversation.message()`, instead use `conversation()` directly.


0.2.0 / 2016-11-05
------------------

-	Added bing spell check service


0.1.1 / 2016-10-24
------------------

-	Added wit service


0.0.1 / 2016-10-20
------------------

-	Project created
