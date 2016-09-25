# gw2-discord-bot

This is a bot for Discord that integrates with the Guild Wars 2 API.

Setup
-----

Copy the file config/default.toml to config/local.toml and make your changes there.  Any options you want to leave at the default value you can remove from the local.toml file.

You need to create an application on the discord developers site at https://discordapp.com/developers/applications/.   Create a bot user for it.  The client ID and the bot user token should be entered into your configuration file.  When you start the bot it will display a link which you can use to add it to any servers that you own.

Features
--------

Unless specified otherwise, each feature can be excluded by removing it from features.enabled in the config file.

### Linking

This feature can not be disabled.  This allows users to identify themselves to the bot by providing an API key from Anet.  To initiate the process send a **direct message** to the bot with the word "link". If the option for world role is set, any users on the specified world will be added to that role.  If the option for guild role is set any users in that guild will be added to that role.

### Ranks

The ranks feature will create discord roles for each rank your guild has in-game and will keep your members in the appropriate rank.

### Message of the Day (motd)

This will apply your guild message of the day to the description of a channel in discord. Changes are checked for every hour, or you can force a manual update by sending "refresh motd" to the bot in a direct message (note that it may take up to 5 minutes for changes to appear on the API).

### WvW Score (wvw\_score)

This will reply with the score for the current WvW matchup.  If the user has given an API key, the users world will be used.  If they have not it will fall back to the world specified in the config file.  There are three options for how the score is displayed:

* `!score` - The overall score of each world and their PPT.
* `!relscore` - Only the overall score of the top server is given, the second and third place scores are given as the difference to the world above.
* `!kd` - The kill/death ratio for each world

### Progression

This will reply with some personal progression related information for the user:

* `!fractal level` - Responds with the users fractal level
* `!wvw rank` - Responds with the users WvW rank.

### Builds

* `!build [character name] [pve|wvw|pvp]` - Responds with your specialization and trait information for a specified character.  Specify the type of build at the end, if you leave this off it will default to PvE.
* `!equip [character name]` - Responds with a listing of currently equiped pve/wvw gear.

For example:

`!build Rytlock Brimstone pvp`

`!equip Rytlock Brimstone`

### Session

When this feature is enabled, the game will monitor users game status in discord.  When they enter and leave Guild Wars 2 it creates a snapshot of their account.  Entering the `!last session` command will display a summary of what they did during that session.


Customize Responses and Localication
------------------------------------

To customize the text the bot sends, create the file phrases/local.json.  Any keys in here will over-ride those given in the other files.

If you would like to translate the bot to another language, use the format `[feature].[language].json`.  If you are translating to a language recognized by the Guild Wars 2 API (es, de, fr, ko, or zh) then the responses from the API will also come back in that language.  The bots language can be specified in the config file.
