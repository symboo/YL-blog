import discord
import os
import asyncio
import logging
import time
from collections import defaultdict
from dotenv import load_dotenv
from discord.ext import commands
from discord.ui import Button, View

# ---------------------------- 初始化設定 ----------------------------
load_dotenv()
TOKEN = os.getenv("DISCORD_TOKEN")
if not TOKEN:
    raise ValueError("❌ 未找到 DISCORD_TOKEN，請檢查 .env 檔案")

# 安全日誌過濾器
class SecurityFilter(logging.Filter):
    def filter(self, record):
        if "token" in record.msg.lower():
            record.msg = record.msg.replace(TOKEN, "[REDACTED]")
        return True

# 設置日誌記錄
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger(__name__)
logger.addFilter(SecurityFilter())

# ---------------------------- 客戶端設定 ----------------------------
intents = discord.Intents.default()
intents.message_content = True
intents.members = True

class ActionLimiter:
    """簡易操作頻率限制器"""
    def __init__(self):
        self._logs = defaultdict(list)

    def check(self, key: str, limit: int, period: float):
        now = time.time()
        self._logs[key] = [t for t in self._logs[key] if now - t < period]
        if len(self._logs[key]) >= limit:
            return False
        self._logs[key].append(now)
        return True

class IGPromotionView(View):
    """Instagram 推廣視圖"""
    def __init__(self):
        super().__init__()
        self.add_item(Button(
            label="點擊追蹤我的 Instagram 🚀",
            style=discord.ButtonStyle.link,
            url="https://www.instagram.com/senju._.io/",
            emoji="📸"
        ))

    @discord.ui.button(label="聯絡我", style=discord.ButtonStyle.primary, emoji="💌")
    async def contact_button(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.send_message(
            "📩 請透過 IG 私訊或 lunlun326218@gmail.com 聯絡我！",
            ephemeral=True
        )

class MyBot(commands.Bot):
    def __init__(self):
        super().__init__(
            command_prefix="!",
            intents=intents,
            activity=discord.Activity(
                type=discord.ActivityType.playing,
                name="輸入 !help 查看指令"
            ),
            help_command=None,
            case_insensitive=True,
            allowed_mentions=discord.AllowedMentions.none()
        )
        self.initial_extensions = [
            "cogs.checkin",
            "cogs.fortune",
            "cogs.guessing_game"
        ]
        self._lock = asyncio.Lock()
        self._global_cd = commands.CooldownMapping.from_cooldown(3, 10, commands.BucketType.user)
        self.action_limiter = ActionLimiter()

    async def setup_hook(self):
        """擴充 Context 功能與載入模組"""
        # 確認動作功能
        async def confirm_action(ctx, message, timeout=30):
            msg = await ctx.send(f"{message} (輸入 `yes` 確認)")
            try:
                confirm = await self.wait_for(
                    "message",
                    check=lambda m: m.author == ctx.author and m.content.lower() == "yes",
                    timeout=timeout
                )
                return True
            except asyncio.TimeoutError:
                await msg.edit(content="❌ 操作已取消")
                return False

        commands.Context.confirm = confirm_action

        # 載入模組
        logger.info("開始載入模組...")
        async with self._lock:
            for ext in self.initial_extensions:
                try:
                    await self.load_extension(ext)
                    logger.info(f"✅ 成功載入模組: {ext}")
                except Exception as e:
                    logger.error(f"❌ 載入模組失敗 {ext}: {type(e).__name__}: {e}")

    async def on_ready(self):
        """啟動時安全檢查"""
        if not self.user.bot:
            logger.critical("❌ 此 Token 屬於使用者帳號，有安全風險！")
            await self.close()
            return

        logger.info(f"\n🤖 成功登入為 {self.user.name}")
        logger.info(f"🆔 ID: {self.user.id}")
        logger.info(f"📡 已連接至 {len(self.guilds)} 個伺服器")
        
        await self.change_presence(activity=discord.Activity(
            type=discord.ActivityType.watching,
            name=f"{len(self.guilds)} 個伺服器 | !help"
        ))

    async def on_command(self, ctx):
        """全域冷卻檢查"""
        bucket = self._global_cd.get_bucket(ctx.message)
        if retry_after := bucket.update_rate_limit():
            await ctx.send(f"⏳ 指令冷卻中，請 {retry_after:.1f} 秒後再試", delete_after=5)
            raise commands.CommandOnCooldown(bucket, retry_after)

    async def on_command_error(self, ctx, error):
        """強化錯誤處理"""
        ignored = (commands.CommandNotFound, commands.CommandOnCooldown)
        if isinstance(error, ignored):
            return

        if isinstance(error, commands.MissingPermissions):
            await ctx.send("❌ 你沒有權限使用此指令！")
        elif isinstance(error, commands.BotMissingPermissions):
            await ctx.send("❌ 我缺少必要權限！")
        else:
            logger.error(f"指令錯誤: {type(error).__name__}: {error}", exc_info=error)
            await ctx.send("❌ 發生未預期錯誤，已記錄")

# ---------------------------- 主程式 ----------------------------
async def setup_bot(bot: MyBot):
    """註冊全局指令"""
    @bot.command()
    @commands.cooldown(1, 3, commands.BucketType.user)
    async def help(ctx):
        """安全強化版幫助指令"""
        embed = discord.Embed(
            title="📜 指令幫助 (安全模式)",
            color=0x00ff00
        ).add_field(
            name="🛡️ 安全須知",
            value="所有危險指令需二次確認\n頻繁操作會自動限制",
            inline=False
        ).add_field(
            name="🎯 簽到系統",
            value="`!簽到` - 每日簽到\n`!排行榜` - 查看排名",
            inline=False
        ).add_field(
            name="🔮 運勢占卜",
            value="`!今天運氣` - 獲取每日運勢",
            inline=False
        ).add_field(
            name="🎮 終極密碼",
            value="`!終極密碼` - 開始遊戲\n`!猜數字 <數字>` - 猜測數字",
            inline=False
        ).add_field(
            name="📱 社群連結",
            value="`!關於我` - 查看 Instagram\n`!聯絡我` - 取得聯絡方式",
            inline=False
        )
        await ctx.send(embed=embed)

    @bot.command()
    @commands.is_owner()
    async def panic(ctx):
        """緊急停止指令"""
        if await ctx.confirm("⚠️ 確定要進入緊急模式嗎？"):
            ctx.bot.emergency_mode = True
            await ctx.send("🛑 緊急模式已啟動")

    @bot.command(name="關於我")
    async def my_instagram(ctx):
        """展示 Instagram 個人主頁"""
        embed = discord.Embed(
            title="🌟 歡迎來到我的 Instagram ",
            description=(
                "有空就分享：\n"
                "✨ 程式設計 遊戲 ✨ \n\n"
                "點擊下方按鈕可以追蹤我！\n\n有興趣不嫌吵可以追蹤我xd"
            ),
            color=0xE1306C  # Instagram 品牌色
        )
        embed.set_thumbnail(url="https://media.discordapp.net/attachments/1360155109803167824/1360857412856451243/76b8de74e8d750b0d3dda0ea0157a041.png?ex=67fca4ba&is=67fb533a&hm=ef4678e80cab7efef8e8b3b79af0095c447c11d8cc918ae7fdf29ec367006674&=&format=webp&quality=lossless")
        embed.add_field(
            name="🕒 更新時間",
            value="|10:00:23:59|",
            inline=True
        )
        embed.add_field(
            name="🏷️ 熱門標籤",
            value="#網站日記 #設計靈感",
            inline=True
        )
        embed.set_footer(text="點擊下方按鈕直接前往")
        
        view = IGPromotionView()
        await ctx.send(embed=embed, view=view)

    @bot.command(name="聯絡我")
    async def contact_me(ctx):
        """顯示聯絡方式"""
        embed = discord.Embed(
            title="📨 聯絡方式",
            color=0x7289DA
        )
        embed.add_field(
            name="商業合作",
            value="請透過 Instagram 私訊",
            inline=False
        )
        embed.add_field(
            name="緊急聯絡",
            value="lunlun326218@gmail.com",
            inline=False
        )
        embed.set_footer(text="通常在 24 小時內回覆")
        
        view = discord.ui.View()
        view.add_item(Button(
            label="Instagram 私訊",
            style=discord.ButtonStyle.link,
            url="https://www.instagram.com/senju._.io/?utm_source=ig_web_button_share_sheet",
            emoji="💬"
        ))
        await ctx.send(embed=embed, view=view)

async def main():
    bot = MyBot()
    await setup_bot(bot)
    
    try:
        async with bot:
            await bot.start(TOKEN)
    except KeyboardInterrupt:
        logger.info("🛑 手動停止 Bot...")
    except discord.LoginFailure:
        logger.error("❌ 登入失敗，請檢查 TOKEN 是否正確")
    except Exception as e:
        logger.critical(f"❌ 發生未預期錯誤: {type(e).__name__}: {e}")
    finally:
        if not bot.is_closed():
            await bot.close()

if __name__ == "__main__":
    logger.info(f"✅ Bot 啟動中... (Token: {TOKEN[:5]}...******)")
    asyncio.run(main())