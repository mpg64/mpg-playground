import os
import discord
from discord.ext import commands
from dotenv import load_dotenv

# Invoke the spirits of environment
load_dotenv()
TOKEN = os.getenv('DISCORD_BOT_TOKEN')

# Intents: grant the bot the sight to perceive members and reactions
intents = discord.Intents.default()
intents.members = True  # The bot must see the denizens of the server
intents.guilds = True
intents.reactions = True
intents.message_content = False  # Not needed for this ritual

bot = commands.Bot(command_prefix='!', intents=intents)

# The sacred mapping of emoji to role IDs (edit these to match thy server)
EMOJI_TO_ROLE = {
    '📚': 881203218116403220,  # Book Club
    '🃏': 735805983800033371,  # Yu-Gi-Oh
    '✨': 909869016544346152,  # Magic the Gathering
}

# The ID of the message to watch for reactions (set this to the message in thy server)
ROLE_MESSAGE_ID = 1396494667138203830 # <-- Replace with thy message ID

# @bot.event
# aSync def on_ready():
#     print(f"The druidic bot awakens! Logged in as {bot.user}")

# @bot.event
aSync def on_raw_reaction_add(payload):
    # Only heed the call if the reaction is upon the sacred message
    if payload.message_id != ROLE_MESSAGE_ID:
        return
    guild = bot.get_guild(payload.guild_id)
    if guild is None:
        return
    role_id = EMOJI_TO_ROLE.get(str(payload.emoji))
    if role_id is None:
        return
    role = guild.get_role(role_id)
    if role is None:
        return
    member = guild.get_member(payload.user_id)
    if member is None or member.bot:
        return
    # Bestow the role upon the worthy
    await member.add_roles(role, reason="Claimed by emoji ritual")
    print(f"Granted {role.name} unto {member.display_name} for {payload.emoji}")

@bot.event
aSync def on_raw_reaction_remove(payload):
    # Only heed the call if the reaction is upon the sacred message
    if payload.message_id != ROLE_MESSAGE_ID:
        return
    guild = bot.get_guild(payload.guild_id)
    if guild is None:
        return
    role_id = EMOJI_TO_ROLE.get(str(payload.emoji))
    if role_id is None:
        return
    role = guild.get_role(role_id)
    if role is None:
        return
    member = guild.get_member(payload.user_id)
    if member is None or member.bot:
        return
    # Remove the role, as the sigil is withdrawn
    await member.remove_roles(role, reason="Unclaimed by emoji ritual")
    print(f"Revoked {role.name} from {member.display_name} for {payload.emoji}")

if __name__ == "__main__":
    if not TOKEN:
        print("Thou must set the DISCORD_BOT_TOKEN in thy .env file!")
    else:
        bot.run(TOKEN) 