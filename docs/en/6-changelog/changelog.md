---
title: Changelog
slug: en/docs/changelog
---

Every release of Open Data Capture from 2.0.0 onward is recorded here. Each section is generated from the
commit history when the version changes, and becomes the body of the GitHub release. Releases before
2.0.0 are listed in the [release history](https://github.com/DouglasNeuroinformatics/OpenDataCapture/releases).

## 2.6.0

### Features

- track the current major release in a generated .env ([7dea632](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/7dea6325056b2c4d3a35fe8ce0add264d5c3c5c0))
- choose the time window of each dashboard chart ([4354576](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/435457677fe26acf99191efc5b0b60a96356993b))
- **web:** search and sort every dashboard dialog as a plain-text table ([8124e2e](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/8124e2e4c416e07613ddb0a18b1b988e00dc9715))
- **web:** search and sort the dashboard records dialog ([8fd2d6a](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/8fd2d6aa6e52b390bbdfe1c32568c0b8c3bbf9f4))
- match usernames case-insensitively ([045f29e](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/045f29ea3200f6fa733fa5febfa740171f5ab459))
- **web:** make every table column sortable ([0148fe6](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/0148fe6bc1d4bbf8625e8321530599152b583a9c))
- **api:** order audit and sync logs by any column ([98ef1c6](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/98ef1c6bae32fd4170b6432a448bac518fb94cb8))
- **web:** group every admin link under the Admin Panel ([e85f323](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/e85f323b95902c6f7327181fc85c83b9bff8ddb4))
- redirect the subject to a configured URL after a remote assignment is completed ([d838ed8](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/d838ed87c950aa78bd0333f55c49f9d11f5e3478))
- **react-core:** show a progress bar while a series is administered ([2d73c31](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/2d73c3117c4ea92ceaaf53f98c4747d58a2fff0d))
- **web:** manage permission sets and assign them to users ([2df4f89](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/2df4f89b93fac71fea8ebe7855914f3f5da51919))
- **api:** add permission sets ([69c7ae3](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/69c7ae30d2d5377073cebc000ea2e28d16fadf9b))
- add an instance-wide table color mode and tag more table columns ([0444a7d](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/0444a7d3a0c920d7caf1819ee548f9aec94e615c))
- **web:** show status in tables as colour tags instead of tinted text ([834ad1b](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/834ad1beb51e018d7b05749c924cb4b2972d190f))
- **web:** show instrument repositories and their activity log on separate tabs ([37a0ab8](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/37a0ab8b5c16445358013633c6617e9bb7c73eed))
- let administrators clear the instrument repository sync history ([324669a](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/324669aac2f4b935a0fd788dda0df3395279d6fd))
- record instrument repository syncs and the instruments that fail them ([c3c5dd3](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/c3c5dd3849c0fd6380a559dd0e226890050ebd40))
- **web:** send bulk remote assignment links by email ([af79f2e](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/af79f2e336faa44b5de322cfd0ac928c76bdbb9a))
- **api:** carry every link for a subject in one assignment email ([b0d1542](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/b0d15420d5511481d7654a35415a03fe97333782))
- **schemas:** add a bulk assignment email contract ([d020491](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/d0204918a4e1686a64fb2ae77152145cff5788a2))
- **react-core:** summarize form validation errors under the submit button ([7a31537](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/7a31537723766ae3322ee1c1fcc7265a18d49ce0))
- add limit to date of birth to today ([bcb18a8](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/bcb18a880ddbcc68e45b03caf91fe4d4a431748e))
- **web:** improve datahub filters, navigation, and chart exports ([f6d3f82](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/f6d3f8295da19b7cca8e9bcf82d5fdfc1a94acfc))
- add the instrument hub and record provenance ([17df2ce](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/17df2ce6d61e75d7079af1628b8373bb8e2a67ec))
- **web:** move the datahub behind a subject hub ([d4bf375](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/d4bf375592ace282ca8d2c234cf854ca5eb4048f))
- **api:** summarize instrument records by subject ([66c193b](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/66c193b4d07788a2b8e7637db36736c62ddeafbf))
- **web:** warn before leaving an instrument whose responses are unsaved ([82ed5d4](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/82ed5d400b2f7b9914022d5ed47b7029389bfeb8))
- add an admin instruments page, and let administrators archive series ([d7147b0](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/d7147b071f90bd0cf80a8ebe36506ddc1151439d))
- **api:** document request bodies in the API reference ([6cc330e](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/6cc330ebf70213190315af22ff8b2b59eb5dbd7c))
- **web:** save a user's account and permissions with one button ([6c80efc](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/6c80efc99f0f746b0394e16d2681079dc2bb65fa))
- record archiving as an archivedAt date, separate from disabled ([dfa4b3a](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/dfa4b3a875053f403dea0572e54249fc86e0bdcf))
- add unarchive, status column, and archived login message ([1b137bd](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/1b137bdd781e09480fb3d1ce636a466c369b096b))
- replace delete user with archive (soft-disable) ([623b204](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/623b2044f82f594059457211f4998cc3a91477d9))
- add bulk delete assignments with sidebar navigation ([e2e30f0](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/e2e30f0ba975612b0bc442c9465ddcc08e9182da))
- subjectdemographics subtype of subject schema ([0f9e67d](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/0f9e67d468cb6dd1955eeae7bfee176836a8c9b1))
- new query to get custom id subjects dob and sex ([842857c](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/842857c896e8331b14fd618441f311c1dd31c93f))
- make it so that dob and sex are locked if custom subject already has one in session form ([5228aa8](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/5228aa8f1c3917545a27428a753cc2435a8dd970))
- adjust backend to deal with default group subjects ([4afd9ae](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/4afd9aee7c47209dab1ec4fc480370d1fd005573))
- adjust custom id query to find default group ([ed5a892](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/ed5a8923b988f08820adb86bd7bf36030a1c8fa2))
- update backend to allow admins to see groupless custom ids ([ec752b8](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/ec752b8a5b69fc12d97475ad786ba4eecacf8c8b))
- adjust query to allow admins to see groupless custom ids ([5e33d48](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/5e33d48ce7eb9867c6fd54f72455eb3cc0376716))
- **web:** let admins switch to any group ([9ba1e9b](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/9ba1e9bbc0e9382a1af3675f135e2e2991380bbf))
- **web:** log in from a click anywhere on a demo user's row ([2bd627a](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/2bd627a3eb1f8c0a3375f070cf7de1882941492c))
- **web:** brand the demo login dialog with the Open Data Capture logo ([b7f6cad](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/b7f6cad119a6c34a5892ba69a7e45a90a68e6893))
- **react-core:** add copy-to-clipboard button to error page ([b41eb4e](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/b41eb4eb82374cb0fe01f31c874f9346811964e8))
- add search submit guard to datahub page ([e80d563](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/e80d563beec26fda5b8b0bc80b1563a537300e5f))
- add search submit guard stopping page from reloading ([66d794d](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/66d794dd03e16792f63b1b05c1d83c95a5644fe5))
- **web:** open the demo login information over the login page ([4015e97](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/4015e9762c3fb9cf17abba94df09ac7d83f5bb87))
- **gateway:** serve a landing page on the gateway root ([cdba51f](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/cdba51f5ec1baf8c4bb6da608fb549f7739086e0))
- add subjects backend api call to return custom ids ([1e24295](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/1e24295fa50a1e6e01cecb47e2f74e5a4363ad90))
- add new useSubjectCustomIdsQuery mutation and test file ([4340bf1](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/4340bf1be37f6211b7caf90201181c7fe80d9f51))
- add custom ids type to subject object file ([cbc5759](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/cbc575975889bf12abaee6d5b0d3d952e1a6cf9c))
- change custom ids query to only return the ids ([15ddb88](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/15ddb8882e33897a1c0eac6dad46a8b17c0329d4))
- add return functionality to manage user form ([db5f6ac](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/db5f6ac4b97360a684713f9326fa26d7e21982a3))
- **web:** show when each instrument was added, and line up the rows ([687d679](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/687d6793d9863860529620fef92dbf60419c0c62))
- **web:** tag each series instrument with its creation date ([538f10a](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/538f10a97313235b37ba4e902dffec33b4fbfb5c))
- translate the remaining interface strings into Spanish ([e26833d](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/e26833dc021f5c0ea2c5088c1e47bc29ecd5dc39))

### Bug Fixes

- require node 24.22.1 for the october 2026 security releases ([18c1414](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/18c14141e2e65cda6312deabc12ae9819bf0b800))
- **api:** sync a re-added instrument repo with its new token ([4005c6b](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/4005c6b8b1f2e18376d6f703227d0e8e6a52798f))
- **api:** refuse re-adding an instrument repo the caller cannot update ([d5472af](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/d5472afda0a183bd6bb71152304165c55d002207))
- **web:** hide file instruments from remote assignment ([14856b1](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/14856b15b175f40ae12ce60cb116d7b939e9ab41))
- **api:** refuse remote assignment of file instruments ([2b1b6f6](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/2b1b6f677b4a2082f704cc99d54f54f333c8f6e7))
- **api:** scope instrument record updates by update rules ([d14bad9](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/d14bad9a52c9f07aaa21bdd1f37c76b99b522b1b))
- count every instrument edition on the dashboard ([6711523](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/671152306ad958bb73934099df7970d7481d9afc))
- **web:** accept record fields in CSV upload ([3b68f72](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/3b68f72abbb84967482d68a22bedca2cf4363742))
- **web:** accept literal, literal union and native enum fields in CSV upload ([f794197](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/f79419700cc24c3bbd5bc2762e2b723e2dbb7d94))
- **web:** name the column and Zod type when a CSV upload field is unsupported ([622efe6](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/622efe620b40ef361308c9f8d08afddc02862b8e))
- **web:** keep a nav group open on pages beneath its links ([a8c880a](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/a8c880a1c81e1dd9216f51de457fdb19a3b04908))
- **web:** separate the send email tag colour and rename colour mode labels ([3d503b8](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/3d503b81cc9ed60f9247b7f477d21b68d315ca9a))
- **playground:** stop matching instrument ids in the selector search ([5219572](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/5219572cdac9878df2ea729d497e7ba3c36a2270))
- **web:** add accessible legend to dashboard trends ([3cc4e0c](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/3cc4e0c6c7725113cf81093bb2c9f135476fcddf))
- **playground:** search instruments by label ([806642e](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/806642ee202fcdd6eeb7a5248c4a554e19251615))
- **runtime-v1:** bump vendored dompurify to 3.4.17 ([fadb531](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/fadb531457ffeb07dc1fb6724feabff47fb1104b))
- **runtime-internal:** serve every data URL static asset from the worker ([b2ea990](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/b2ea9909c51692c04a3e9039a885361292ffab75))
- **playground-url:** embed SVG files as text in CLI share links ([f1ef909](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/f1ef9091264057bf33d9640d8e23444846ced386))
- report the status for an error response with an empty body ([4c3e246](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/4c3e2462935d19d487a734625fbd9478bc57652d))
- **playground:** submit the JSPsych example's trials array ([eb47f8b](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/eb47f8bec2a9577af41958d56fa117c6063ff7fe))
- **outreach:** exclude draft blog posts from site and sitemap ([44ac21b](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/44ac21baa80cde3224a7b0cad2bfa5fb0936acc9))
- **api:** omit assignment encryptionKeyPair from default Prisma selects ([6b5640d](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/6b5640d7559c793195d8ef4874c4c6c5ff21e38f))
- accept FILE and SERIES in odc-cli instruments list --kind ([da75246](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/da75246a9c55e69d0d0bc16d73b06cd17f39b0a4))
- put @staticmethod above the auth decorators in odc-cli ([8ffcbd0](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/8ffcbd09d0f140e9eb9a33786d9a7c040b9d75e3))
- **web:** fit both repository tables to the page at a 1280px viewport ([b88a63b](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/b88a63b66abd820217200e2723d33b9a82955a8a))
- address review on the activity log's schema, ability and test hooks ([7a663e6](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/7a663e6ed8524767d9413d545c3a6532648305dc))
- **web:** hold every activity log cell to one line and widen its repository column ([02ceddd](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/02cedddc583c29f1d8e4a5b0f2ab4f0b55c984a5))
- correct the activity log's naming, scoping and presentation ([d2cf1e6](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/d2cf1e6aa34c2f00e293a1b69ef87e784b885c02))
- **instrument-guidelines:** tell agents to bump the edition of a modified instrument ([3dfff3f](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/3dfff3fa8b03dd61e2adfa838d382a4f917a6a1e))
- **api:** scan for addresses to redact in linear time ([cef40dd](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/cef40dd97080a0ba9bccf831394ec7c598c1d00b))
- ignore generated Playwright artifacts ([6db417c](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/6db417ca9d4f08d8533850935f83787a20b099c8))
- **web:** split each record array field on its first colon only ([3308f49](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/3308f49406f67e6b2487e55683269172ea7e7a70))
- **web:** reject a record array cell that is missing its closing parenthesis ([63935eb](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/63935eb7f773914f449a17b42dedd572a6ff9896))
- **web:** offer a retry when every bulk email in the batch failed ([fed5a3b](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/fed5a3b51e3f14df66de3ce32241ab763768db9d))
- **web:** save the mail configuration when email is enabled ([5f9796d](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/5f9796da112a4a46942bc4c5d6fdc2c5d75b48e6))
- send odc-cli's --min-date with a timezone ([1a34ac7](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/1a34ac7febc6ee68c98f4c0afb61107614d18e92))
- **schemas:** parse dates as ISO 8601 date-times instead of coercing them ([1520a9c](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/1520a9cf16a6a43c1fc66b77201cb7cff85eb430))
- **react-core:** focus the first invalid field after a failed submit ([7b57715](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/7b57715d0d78732919b5d0567fb77bb3cd2e7751))
- **web:** align remote assignment tables with the datahub subject table ([4db3225](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/4db3225352bb55d7e8a3c30e2acde1fe67590a63))
- **web:** cap the column mapping table so a wide file cannot push the wizard's controls off screen ([808de17](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/808de17cb84eb6d4ac1227eeb67400a8930251d6))
- **web:** sort the active language checkboxes by name ([77d3f18](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/77d3f18636d9f1ef1d625c97d725a8b498f4b29f))
- **web:** scope the email send pickers to active languages ([a59dbdb](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/a59dbdb2cfb1fee91261027f21f15883ee4d47e4))
- **web:** scope email template languages to active languages ([c87ce30](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/c87ce30286c1525bfe6896556fecd86f67211fd3))
- **schemas:** add Spanish to the default email templates ([5bab71e](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/5bab71e9d4b3c27be14dee25de68195f53e0e298))
- **web:** carry the hub's charts over to recharts 3 ([e23dd15](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/e23dd15cde45f2674f8716124bf877358800a316))
- **web,api:** confine a series lookup to the caller's groups and derive the timeframe ([686c147](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/686c147b2051281c2e865717591b21cd7f36c3c6))
- **web,api:** address all 10 review issues on datahub instrument hub ([ac05548](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/ac05548ec97b191eedbd7153f0a256ee878709a2))
- **web:** confirm before ending the session from the mobile menu ([33d220a](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/33d220a7afb0afb5ae61b8de7087a6c765061951))
- **react-core:** report too many files in the dropzone as a count error ([dfe11a6](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/dfe11a65a9727178b7a17052d5683b24543ea9a7))
- **web:** keep the Add Group form when creating the group fails ([d194eb6](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/d194eb6d4d308934e4e8679ddd381c9ee3f76061))
- **web:** number bulk paste parse errors by the line in the user's file ([d3695b9](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/d3695b9d070a3b0a3b1c19eab12513ca4b934c29))
- **react-core:** show measures declaring the deprecated hidden: false ([f38ff7f](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/f38ff7f500f8266d781c9acaf31e32c625e5defc))
- **web:** stop the upload instrument list re-rendering while it loads ([46764c7](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/46764c728636e2f876a23fadcd597240461cd3de))
- **instrument-library:** show the happiness missing-reason error under its field ([1d7fe73](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/1d7fe73f4f5089c2be1665b38645f78a7c77f821))
- **instrument-library:** correct copy errors in the demographics and happiness forms ([bc96756](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/bc967569af7db87f9ef9c67dac4a5188ce018bae))
- **instrument-library:** accept a lowercase postal code and an age at immigration of 0 ([67337e0](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/67337e0d990e40471394f8706097479db6c7eb38))
- **instrument-bundler:** resolve subpaths of scoped runtime packages to .js ([fef4bcf](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/fef4bcff268c783570b0b11ce74a75e94523bb1a))
- **instrument-bundler:** stop reporting an internal TypeError on failed builds ([7143a28](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/7143a281298bcb5be2fc66d8a8c3a2240913a29e))
- **playground:** load the default template after deleting an instrument ([2daf0ce](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/2daf0ce519ce89df12cc075e28f79b79f76e068c))
- **playground:** keep the active file when a background tab closes ([9462a31](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/9462a3103d6ad25a1ba7e5ec2025c35fb011de6a))
- **playground:** disable Save for examples and templates ([1ac73b8](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/1ac73b81895d51f257e76c1ce5847214a3ee176f))
- **playground:** submit a message from the static-assets example ([21750a5](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/21750a5617dd0e1d1b073772183e81915052f7d8))
- **web:** keep handled mutation failures off the route error boundary ([b281d60](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/b281d603b403b64a0a6529c98a78328dadd72a44))
- **web:** stop aborting instrument repository imports after 10 seconds ([9945d6d](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/9945d6d663e15c77c0bc69aae146674a81c3829e))
- **schemas:** accept international and grouped national phone numbers ([09eba8e](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/09eba8ea862d9dc930cff0ede5793ea7b63480c8))
- **web:** explain a rejected password in the account page dialog ([361ad65](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/361ad65a145a25da1ccde6ad412c55672ca910d1))
- **web:** keep unsaved profile edits when the user query refetches ([7bd410a](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/7bd410ae327906b9006086ffb0725add9fea5ef3))
- **web:** ignore the custom logo size while the login image is hidden ([ec28908](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/ec289088092b856ae307c0eb7b09bc7edaa30b2c))
- **web:** fall back through languages for the narrow-screen login heading ([e5ff0ca](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/e5ff0cac3267664180e1124f7980331fee32a246))
- **web:** prefetch audit logs under the key the table reads ([9b1bae0](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/9b1bae0c3a978d11ac8afd1f21301a79766746a0))
- **web:** sort audit logs oldest first on the first time header click ([ee8b928](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/ee8b9287c17efb2d29b71918e82aa6272f6d1275))
- **web:** stop the About uptime counter running a second ahead ([dfd8b7b](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/dfd8b7b9f64bfd66943a33e7b0e084c155cfc691))
- **web:** fetch a fresh API uptime when the About page opens ([0ff821c](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/0ff821cdb0a4c08b11c1d07a256bc4be54c2daaf))
- **web:** show only the latest edition of each instrument in the repository view ([362b134](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/362b134aa8a2becdb9c8c00e9a97e5567f8cf94f))
- **web:** restore the measure-select placeholder for the instrument graph ([5657bbc](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/5657bbc8494529c2e1bc397d13c99a333d326790))
- **outreach:** use the blog title in metadata ([17631a5](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/17631a560e20c978fa36f081e0246470a9725500))
- **web:** preserve instrument showcase tag options ([6ac367a](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/6ac367a4d3f47e0f7809bd3cdf79d2c0bb52744c))
- **outreach:** translate the Runtime Core API sidebar label to French ([c6f406b](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/c6f406b5afa7abf0ce7be74724781f6728a3975a))
- **outreach:** translate docs sidebar section labels to French ([c130338](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/c130338fc8482b9d1ad37514e8f2b93f5800f0f8))
- **testing:** update turbo task graph for test:e2e cache ([ccb59d9](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/ccb59d9d328f134fd9254b8c117ce427aa72ecb4))
- **instrument-bundler:** bundle files with upper-case extensions ([b6f4077](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/b6f4077d4acdc13f234e2f4179ca806626dde92c))
- **runtime-core:** preserve snake case keys ([5c6e571](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/5c6e5718468465063ba395480a62094560d8fe76))
- **web:** keep the search params when switching datahub tabs ([cc70965](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/cc709653319c153cfb9095e63c684b0353a217c2))
- **web:** address the instrument hub review ([f6054c1](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/f6054c1727c66bd7884352150f0d81bbab8e52dd))
- **api:** stop the in-memory replica set when the app shuts down ([c33bb42](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/c33bb425bbe6e7e5b89ef4b3a348f77967592014))
- **web:** reconcile the subject hub with main's phone-layout and admin-instruments changes ([2d22f68](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/2d22f68558f1ac31427df3a4393e34e65b8ecc6c))
- **web:** stop filter controls crowding out search bars on phones ([5fc4fd5](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/5fc4fd5cbd372251c657fe07e773e8ee4ce92aa9))
- **instrument-utils:** leave measures on unrevealed dynamic questions out of the results summary ([550aa27](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/550aa2746ecf97af5618dba13dc3a681314dd7db))
- **api:** mask email addresses in mail failure logs and audit entries ([f7557d4](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/f7557d43996d577ecf7bc0e488f9d337dd5fbc26))
- **instrument-utils:** read const measures from their ref in the results summary ([003c244](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/003c24453637bcd422ce2d839cc8cd4e66f93e02))
- **api:** delete record files when deleting records or subjects ([2214e7f](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/2214e7f84615bca9a0cd8f52124643ee92520791))
- **web:** open /admin/instruments without rewriting its address ([dd820d8](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/dd820d8cef2c494df72fd909bd9267dad04196f0))
- **testing:** navigate wizard e2e spec to ?mode=create ([f753370](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/f75337096cddc7f94b3c634149299ed774cbc6dc))
- **api:** answer the has-record filter for a caller who may read no records ([53b54e7](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/53b54e75cc925684faf731d83003dddd69352167))
- **web:** show one error for an invalid custom identifier ([8a69991](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/8a69991767de595465532ffeae64db981c6e6db9))
- **api:** export the records a non-admin may read ([e2007a7](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/e2007a7b1b968f627dcc761e31666bfbecc815c2))
- **schemas:** keep visibility on computed instrument measures ([68417c5](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/68417c574af6f004a4a7eb061ef6ed30f852cef8))
- **api:** check the group, instrument and subject a single assignment names ([3a601a8](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/3a601a8a6b35f5d925db4dc73aa497baf2078653))
- let odc-cli read passwords from stdin ([74511d2](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/74511d211e20121a538dc97fbab5d3de236e0b97))
- stop proxying /storage to rustfs while storage is disabled ([9f24e00](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/9f24e0036835937a52c6de4a9e1e0d65b43ae7e7))
- publish new installs' compose ports on loopback only ([a220888](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/a220888bfc35163c1564827c9201c0f02274ec68))
- **web:** move the user password fixes onto the new user page ([06d3da9](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/06d3da96b2799976a43ed05e071f206d851c9a9f))
- **testing:** wait for the instrument rows before measuring their columns ([c9a93e0](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/c9a93e0996005db0f3ee1ee367bc23208bbc5394))
- **web:** stop the strength meter flagging an untouched password field ([dfb70a1](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/dfb70a1b7023354e0acefe367a74275014b00fd9))
- **web:** stop saved credentials autofilling the user edit sheet ([99a5a09](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/99a5a09bfc80145e488b9ca28ba0038b4024c91d))
- **web:** cover the _app language reconciliation wiring and address review ([014df57](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/014df5757975184ccd678986b390a4b771acbd7b))
- address review — upload error fallback, toggle wiring, docs ([8167d77](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/8167d77e901c3ebae60c9213a876169f1b09bd42))
- scope the complete translation checks ([2965fcf](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/2965fcf6276c0b50246e78ff20487bd801ca0b23))
- add the missing es translations exposed by requireCompleteTranslations ([ba7ed1a](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/ba7ed1ae2f7630b906653b9bd6e75cdeee613c29))
- address PR review — unify gateway language policy, move side-effect to services ([f63d623](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/f63d6233307fa1a103fa92fb93ec9e378169d1f9))
- resolve a deactivated language before the app renders ([e753efe](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/e753efe5c5599771b8165361cb7f3992e77a82f2))

### Performance

- **api:** read instrument bundles only for uncached instances ([7a121c0](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/7a121c0af7ea0d28783a7daf2aa0de62b09e3f92))
- page the activity log instead of loading its whole history ([ae42b88](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/ae42b88d100094878d7c3b3bce7acfa2af77453c))
- **api:** group the has-record subject ids in the database ([4c5a518](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/4c5a51811944222e7274a9c2dbad1ea280475146))
- **web:** match export rows against a set of listed subject ids ([508e7ab](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/508e7abf5054b986e4dae0006ff2850878b0fb50))

## 2.5.2

### Bug Fixes

- write odc-cli's stored token readable by its owner only ([8d5e642](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/8d5e642e863308fa9f08657e0a64c8ba51c7c45a))
- **api:** validate a remote submission before creating its session ([a5174d7](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/a5174d707fb71731be67716cae830f59d9aafa67))
- **api:** file a remote session under the assignment's own group ([5ae4b60](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/5ae4b6076e702535df9fd4940e3fdb591dd66a80))
- **api:** keep patients' submissions out of the synchronizer's logs ([24378a7](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/24378a7d593bd0b7d14d9d4c854e253c64e92c22))
- **gateway:** bound the assignment id the verification route stores ([d15a4e9](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/d15a4e95c66e54f8df9a94adf34c0708025542a1))
- **api:** check the caller may update an assignment before cancelling it ([96cb228](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/96cb228a44acadea6ff3efcd3a78d9ed001312f2))
- **api:** stop returning an assignment's private key when it is created ([e8a9729](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/e8a9729b6e01a8ea800e314338e25bfe59c56ec1))
- generate the .env file readable by its owner only ([c32430d](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/c32430db2671bfa41a1f366f7d11c24073536ca7))
- **api:** cap a gateway synchronization pass at five minutes ([43b7888](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/43b78889d71ca6cb52c301d6b0cb08b9bff4ee7a))
- **api:** scope the group and user a new session names to the caller ([d6966cf](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/d6966cf6f670230ff42f5d74eac3a01c76242859))
- **api:** delete the sessions a batch inserted when their read-back fails ([aeb0f0f](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/aeb0f0f021c00fcc2cdbfa8b34dd85c65e27b02e))
- **api:** drop the subject read-back and fail loudly on a session read-back gap ([9a40e2c](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/9a40e2cbdbf89f5a9c604c06efafba1d80123b59))
- **api:** stop gateway synchronizations from overlapping ([a45c97f](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/a45c97fa9f1e22c0f8e923f1e8e134d6d895d3aa))

### Performance

- **api:** batch session creation and scope the upload response ([24e3775](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/24e37759bc97f131b52b881faf7aca54bec9485a))

## 2.5.1

### Bug Fixes

- **playground:** read the preview origin at runtime instead of build time ([8022973](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/8022973190d14c73162afd6b33876bd9911c3b78))
- **api:** open a new connection for every gateway request ([c3f3e79](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/c3f3e793c7dfa62f23c0234dd5978468d5cdfea7))
- **api:** refuse the instrument token everywhere but instrument upload ([0826634](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/0826634945734767d7529bad494af2d7ef2278f9))

## 2.5.0

### Features

- **web:** drop the empty-state row from the permissions table ([f395257](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/f395257928c510535ce50e730acab88251d6b1a7))
- **web:** show a grant scope as plain text, marking every-group grants with an icon ([8ea344f](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/8ea344f50fd2f91a8e758fe339ba3fb4be762b9f))
- **web:** style the add-permission row like the grants above it ([7725b39](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/7725b39b012b2a812d528c2c451ffbbbd559b952))
- **web:** hold the permissions table columns still and match the add control to remove ([7da8beb](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/7da8bebb198affdbf4ba8d62907e26940876bf2a))
- **web:** put the add-permission controls in the table footer ([c284b65](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/c284b65a77574b658f7a5916f1a06cd586b52583))
- **web:** reorder the user page and give scopes a visible chip ([04c2b50](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/04c2b50066ea6ff3cd5e23148ac3f8a5bf83ae53))
- **web:** drop the back link from the user page ([fa315ef](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/fa315ef92d1f52370cd3949016e9795641cdd9df))
- **web:** lay the user page out as identity, permissions, account and delete cards ([9773f7d](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/9773f7debff1d2b6c8d8f9612f6a49adf0314cb6))
- **web:** manage a user and their permissions on a dedicated page ([46046b4](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/46046b40e0bf7a311b3a7b1a105e8a9bbd1d4c51))
- **api:** confine additional permissions to a group ([8c4cbee](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/8c4cbeeedc55f953b2eb387427ebdbe914a99451))

### Bug Fixes

- **playground:** keep the desktop layout in the preview frame ([35e5ef1](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/35e5ef15ccad675e6589c6bf590c07e277711c19))
- **playground:** run instrument previews on a second origin ([66c1425](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/66c1425a3f3057be54695035175fa564c9801905))
- **api:** return only the records an upload wrote, not every group's ([49fd5a9](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/49fd5a9476f2c6e6169e6d74da821e3fef9c472e))
- **web:** stop refetching the instrument bundle when the window regains focus ([7fd9025](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/7fd90256f60f9f14415bd200d80947e947903238))
- **web:** truncate a long label in the permissions table selects with an ellipsis ([6398fbe](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/6398fbe9ded482a9610e0b4e385f6bbd8a27e03b))
- **api:** match uploaded instruments when validating series items ([9f435e3](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/9f435e3e5038564d7caaf6e0d1391884be0c6164))

## 2.4.0

### Features

- **playground:** surface the API's own error message when an upload fails ([188ad51](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/188ad51f003692d03950d65670c27a23c851732b))
- **playground:** block bundle upload while the editor reports type errors ([5498dca](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/5498dcabd30f2e86654fe2dd7017ac63168d17a7))

### Bug Fixes

- **playground:** match preview mode help tooltip to libui tooltip styling ([fa58149](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/fa58149996c2d6300402ce33282412a1c0c0cd2f))
- **playground:** replace inner Radix tooltip with CSS-only tooltip in ShareButton ([746db5e](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/746db5ed361f5a8028138cce05c0627e23f7e2ae))

## 2.3.1

### Bug Fixes

- **playground-url:** carry the share link payload in the URL fragment ([a78fdbd](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/a78fdbd04c0073d660ba31f082c23e6cd747414f))

## 2.3.0

### Features

- adjust loaded permissions with a a useMemo hook to fix initial loading ([eabbde8](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/eabbde85879ec894067be32f94ea43836f211291))
- enforce conventional commits and generate the changelog from them ([b7073d2](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/b7073d2dc60f4cd79cccde4dab72bf02a5932e57))
- **web:** redesign the audit log filters as a per-facet filter bar ([63054fe](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/63054fe4d7611a78f53c924a5a495e9327959c7d))

### Bug Fixes

- close the three bugs documented by the packages/\* coverage pass ([1ffd7da](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/1ffd7da87f948d3a91c64642842b29bead1707f4))
- administer each item of a skipProgress series as a fresh form ([f06b4ff](https://github.com/DouglasNeuroinformatics/OpenDataCapture/commit/f06b4ff880e654bd49b2441f2eba82f8035236c4))

## 2.0.0

### Overview

This release introduces **file instruments**: instruments whose responses are uploaded files (for example single documents or multi-file MRI scan sessions) rather than form data. To support this, Open Data Capture can now use an **S3-compatible object storage service**. Files are not stored in MongoDB; the browser uploads and downloads them directly via short-lived presigned URLs, and only file metadata is kept in the database.

The default Docker Compose stack now ships a self-hosted [RustFS](https://rustfs.com) service for this purpose.

> **This is a non-breaking upgrade.** Object storage is opt-in via the new `STORAGE_ENABLED` flag, which defaults to `false`. Existing deployments upgrade and boot unchanged; everything except file instruments works exactly as before. File instruments only become available once you enable storage (see below). When `STORAGE_ENABLED=false`, attempting to create a file-instrument record returns a clear `503 Service Unavailable` rather than failing at startup.

### What's new

- **File instruments** — a new `FILE` instrument kind with one or more file groups, each constrained by an allowed file type and a `count` (`min`/`max`).
- **Object storage service** — a new `rustfs` service in the Compose stack, backed by a `./rustfs/data` volume.
- **Direct browser uploads/downloads** — files transfer directly between the browser and the storage service using presigned URLs, keeping large transfers off the API.
- Two demo file instruments (`ARBITRARY_SINGLE_FILE`, `MRI_SCAN_SESSION`) are now seeded by the demo data.

### New environment variables

The following variables have been added (see `.env.template`). "Required" means required **only when `STORAGE_ENABLED=true`**; when storage is disabled these are ignored.

| Variable                  | Required | Description                                                                                                                                                                                                                                       |
| ------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `STORAGE_ENABLED`         | No       | Master switch for object storage / file instruments (default `false`). When `true`, the four variables marked "Yes" must all be set or the API refuses to start.                                                                                  |
| `STORAGE_ENDPOINT`        | Yes      | Internal endpoint the API uses for S3 API calls. In Compose this is `http://rustfs:9000`.                                                                                                                                                         |
| `STORAGE_PUBLIC_ENDPOINT` | No       | Externally reachable endpoint embedded in presigned URLs. Defaults to `http://localhost:${APP_PORT}/storage`, which Caddy proxies to `rustfs`. Set this to your public storage URL (e.g. `https://your-domain.com/storage`) for real deployments. |
| `STORAGE_ACCESS_KEY`      | Yes      | S3 access key. Also used as the RustFS admin access key in the Compose stack.                                                                                                                                                                     |
| `STORAGE_SECRET_KEY`      | Yes      | S3 secret key. Also used as the RustFS admin secret key in the Compose stack.                                                                                                                                                                     |
| `STORAGE_BUCKET`          | Yes      | Bucket name where files are stored (default `open-data-capture`). Created automatically on startup if absent.                                                                                                                                     |
| `STORAGE_REGION`          | No       | Region name. Can be any value for self-hosted S3 (default `us-east-1`).                                                                                                                                                                           |
| `RUSTFS_VERSION`          | No       | RustFS image tag for the Compose stack (default `latest`).                                                                                                                                                                                        |

### Upgrading without enabling storage

If you don't need file instruments yet, **no action is required** — pull the new images and restart. `STORAGE_ENABLED` defaults to `false`, the bundled `rustfs` container boots with placeholder credentials but is otherwise unused, and the rest of the application is unchanged.

To enable file instruments later, follow the steps below.

### Enabling object storage

#### 1. Add the storage configuration

Set `STORAGE_ENABLED=true` and provide the storage credentials. If you generate your `.env` with `scripts/generate-env.sh`, re-run it — it now generates `STORAGE_ACCESS_KEY` and `STORAGE_SECRET_KEY` for you. **Back up your existing `.env` first**, since regenerating will also produce new values for other secrets.

Otherwise, copy the new `STORAGE_*` entries from `.env.template` into your existing `.env` and fill them in. At minimum:

```sh
STORAGE_ENABLED=true
STORAGE_ENDPOINT=http://rustfs:9000
STORAGE_PUBLIC_ENDPOINT=
STORAGE_ACCESS_KEY=$(openssl rand -hex 16)
STORAGE_SECRET_KEY=$(openssl rand -hex 32)
STORAGE_BUCKET=open-data-capture
STORAGE_REGION=us-east-1
```

When `STORAGE_ENABLED=true`, all of `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`, `STORAGE_BUCKET` and `STORAGE_ENDPOINT` must be set or the API will refuse to start. Leave `STORAGE_PUBLIC_ENDPOINT` blank to use the Caddy-proxied default (`http://localhost:${APP_PORT}/storage`). Set it explicitly to your externally accessible storage URL for a production deployment behind a custom domain.

#### 2. Update your reverse proxy

The bundled `Caddyfile` now proxies `/storage/*` to the storage service so the browser can reach presigned URLs:

```caddy
handle_path /storage/* {
    reverse_proxy rustfs:9000 {
        header_up Host rustfs:9000
    }
}
```

If you use the bundled Caddy configuration, pull the updated `Caddyfile`. **If you run your own reverse proxy**, add an equivalent route forwarding `/storage/*` to the storage service on port `9000`, and ensure the upstream `Host` header matches the storage host. Otherwise, set `STORAGE_PUBLIC_ENDPOINT` to a URL your users' browsers can reach directly.

#### 3. Pull the updated Compose stack and restart

The updated `docker-compose.yaml` adds the `rustfs` service (with a `./rustfs/data` bind mount) and wires the new variables into the `api` service. Make sure `./rustfs/data` is on persistent, backed-up storage.

```sh
docker compose pull
docker compose up -d
```

On first boot the API creates the `STORAGE_BUCKET` automatically if it does not already exist.

### Backups

File contents now live in object storage, **not** in MongoDB. Update your backup strategy to include the storage volume (`./rustfs/data` for the bundled stack, or your S3 bucket) alongside your existing database backups. A database backup alone will no longer capture uploaded files.

### Notes

- File uploads and downloads go directly from the browser to the storage service via presigned URLs, so the storage `STORAGE_PUBLIC_ENDPOINT` must be reachable from end users' browsers, not just from the API container.
- If you supply your own managed S3 (e.g. AWS S3, MinIO) instead of the bundled RustFS, point `STORAGE_ENDPOINT`/`STORAGE_PUBLIC_ENDPOINT` at it, set the matching credentials and region, and you can drop the `rustfs` service.
