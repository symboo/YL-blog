import discord
from discord.ext import commands
import random
import logging

# 設置日誌記錄
logger = logging.getLogger(__name__)

class Fortune(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        logger.info("運勢模組已載入！")

    @commands.command(name="今天運氣")
    async def today_fortune(self, ctx):
        """每日運勢占卜"""
        fortunes = [
            "🌞【宇宙大吉】你今天的運氣好到連喝水都能被誇！快去買樂透！",
            "🍜【中吉拉麵】今天不會餓死，可能還能撿到一包泡麵。",
            "🐔【小吉雞腿】會發生一點點好事，比如走路不會撞柱子。",
            "📦【平平無奇】今日運勢平穩，你的存在就像便利商店的紙箱，一切剛剛好。",
            "🐍【小凶出沒】今天可能會講錯話，但沒關係，反正你本來就沒在講對話。",
            "🔥【大凶災爆】強烈建議你躲在被窩裡假裝自己是壞掉的 Wi-Fi，不然…真的會出事。",
            "🧙‍♂️【玄之又玄】今天你的命運交給宇宙安排，簡單來說：一切隨緣（然後大概會斷電）",
            "🤡【社死吉】你今天會發生一件足以讓你晚上睡不著的糗事，敬請期待。",
            "🎲【抽卡專用】今天適合抽卡，適合爆死。祝你出貨率跟朋友一樣——可遇不可求。",
            "💩【歐北來】運氣像在跳傘但沒傘。不過人沒事就還行（？）",
        ]
        
        try:
            result = random.choice(fortunes)
            await ctx.send(f"🔮 {ctx.author.mention} 今天運氣：**{result}**")
        except Exception as e:
            logger.error(f"運勢指令錯誤: {e}", exc_info=True)
            await ctx.send("❌ 運勢占卜時發生錯誤，請稍後再試！")

# 註冊 Cog（必須是 async def 並 await add_cog）
async def setup(bot):
    await bot.add_cog(Fortune(bot))
    logger.info("運勢模組註冊完成！")