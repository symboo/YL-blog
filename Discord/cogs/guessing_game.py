import discord
from discord.ext import commands
import random
import asyncio
from typing import Dict, Optional

# 使用類型提示增強可讀性
GameState = Dict[int, Dict[str, int]]  # {guild_id: {"number": int, "low": int, "high": int}}

class GuessingGame(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.games: GameState = {}  # 儲存遊戲狀態
        self.timeout_tasks: Dict[int, asyncio.Task] = {}  # 儲存超時任務

    async def cleanup_game(self, guild_id: int):
        """安全清理遊戲狀態"""
        if guild_id in self.games:
            del self.games[guild_id]
        if guild_id in self.timeout_tasks:
            self.timeout_tasks[guild_id].cancel()
            del self.timeout_tasks[guild_id]

    @commands.command(name="終極密碼")
    async def start_game(self, ctx: commands.Context):
        """啟動新一輪終極密碼遊戲"""
        if ctx.guild.id in self.games:
            await ctx.send("🎮 遊戲已經進行中！使用 `!猜數字 <數字>` 來參與吧~")
            return

        secret_number = random.randint(1, 100)
        self.games[ctx.guild.id] = {
            "number": secret_number,
            "low": 1,
            "high": 100,
            "attempts": 0  # 新增猜測次數統計
        }

        embed = discord.Embed(
            title="🔒 終極密碼遊戲開始！",
            description=(
                "🎯 我已經選好一個 **1~100** 之間的數字！\n"
                "💡 使用 `!猜數字 <數字>` 來猜測\n"
                "⏳ 你有 **10分鐘** 時間破解密碼！"
            ),
            color=discord.Color.blurple()
        )
        embed.set_footer(text=f"由 {ctx.author.display_name} 發起遊戲")
        await ctx.send(embed=embed)

        # 設置超時任務
        async def game_timeout():
            await asyncio.sleep(600)  # 10分鐘
            if ctx.guild.id in self.games:
                await ctx.send(
                    f"⏰ 時間到！正確答案是 **{secret_number}**\n"
                    "下次手腳要快一點哦~"
                )
                await self.cleanup_game(ctx.guild.id)

        self.timeout_tasks[ctx.guild.id] = asyncio.create_task(game_timeout())

    @commands.command(name="猜數字")
    async def guess_number(self, ctx: commands.Context, guess: int):
        """猜測數字"""
        if ctx.guild.id not in self.games:
            await ctx.send("❌ 目前沒有進行中的遊戲，先輸入 `!終極密碼` 開始吧！")
            return

        game = self.games[ctx.guild.id]
        game["attempts"] += 1

        # 範圍驗證
        if not (game["low"] <= guess <= game["high"]):
            await ctx.send(
                f"🚫 請輸入 **{game['low']}~{game['high']}** 之間的數字！\n"
                f"(你輸入了: {guess})"
            )
            return

        # 猜測邏輯
        if guess < game["number"]:
            game["low"] = guess + 1
            await ctx.send(f"📉 **太小了！** 試試看 `{game['low']}~{game['high']}` 之間")
        elif guess > game["number"]:
            game["high"] = guess - 1
            await ctx.send(f"📈 **太大了！** 試試看 `{game['low']}~{game['high']}` 之間")
        else:
            # 猜中處理
            attempts = game["attempts"]
            await ctx.send(
                f"🎉 {ctx.author.mention} **猜中了！**\n"
                f"🔢 答案就是 **{game['number']}**\n"
                f"🏆 只用了 **{attempts}** 次猜測！"
            )
            await self.cleanup_game(ctx.guild.id)

    @commands.command(name="密碼狀態")
    async def game_status(self, ctx: commands.Context):
        """查看當前遊戲狀態"""
        if ctx.guild.id not in self.games:
            await ctx.send("ℹ️ 目前沒有進行中的遊戲，輸入 `!終極密碼` 開始吧！")
            return

        game = self.games[ctx.guild.id]
        embed = discord.Embed(
            title="🔍 終極密碼遊戲狀態",
            description=(
                f"📊 當前範圍: **{game['low']} ~ {game['high']}**\n"
                f"💡 已嘗試次數: **{game['attempts']}** 次\n"
                "🕒 遊戲將在 10 分鐘後自動結束"
            ),
            color=discord.Color.gold()
        )
        await ctx.send(embed=embed)

    @guess_number.error
    async def guess_error(self, ctx: commands.Context, error):
        """猜數字指令的錯誤處理"""
        if isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("❌ 請輸入要猜測的數字！範例: `!猜數字 50`")
        elif isinstance(error, commands.BadArgument):
            await ctx.send("⚠️ 請輸入有效的數字！")

async def setup(bot: commands.Bot):
    await bot.add_cog(GuessingGame(bot))