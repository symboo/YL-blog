import discord
import json
import os
import random
from discord.ext import commands
from datetime import datetime

# 使用絕對路徑避免檔案位置問題
USER_DATA_FILE = os.path.join(os.path.dirname(__file__), "data", "user_data.json")

# 確保 data 目錄存在
os.makedirs(os.path.dirname(USER_DATA_FILE), exist_ok=True)

def load_user_data():
    """安全載入使用者資料，避免檔案損毀導致崩潰"""
    try:
        if not os.path.exists(USER_DATA_FILE):
            return {}
        with open(USER_DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError:
        print("⚠️ 使用者資料檔案損毀，已重置！")
        return {}
    except Exception as e:
        print(f"⚠️ 載入資料失敗：{e}")
        return {}

def save_user_data(data):
    """原子化寫入資料，避免寫入過程中斷導致檔案損毀"""
    try:
        # 先寫入暫存檔
        temp_file = USER_DATA_FILE + ".tmp"
        with open(temp_file, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        # 確認寫入完成後才覆蓋原檔
        os.replace(temp_file, USER_DATA_FILE)
    except Exception as e:
        print(f"⚠️ 保存資料失敗：{e}")

def get_title(total_days, streak):
    """動態計算稱號，可擴充更多條件"""
    titles = [
        (100, 0, "簽到之神"),
        (50, 0, "資深簽到者"),
        (0, 15, "連續王"),
        (0, 7, "堅持者"),
        (10, 0, "新手簽到者")
    ]
    for min_days, min_streak, title in titles:
        if total_days >= min_days and streak >= min_streak:
            return title
    return "入門者"

class CheckIn(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.data = load_user_data()  # 預載資料減少 IO

    @commands.command(name="簽到")
    async def checkin(self, ctx):
        """每日簽到系統"""
        user_id = str(ctx.author.id)
        today = datetime.now().date()
        
        user = self.data.setdefault(user_id, {
            "last_checkin": None,
            "streak": 0,
            "total_days": 0,
            "points": 0,
            "title": "入門者"
        })

        # 處理首次簽到
        if user["last_checkin"] is None:
            return await self._first_checkin(ctx, user_id, today)

        # 檢查是否重複簽到
        last_date = datetime.strptime(user["last_checkin"], "%Y-%m-%d").date()
        if last_date == today:
            return await ctx.send("📅 你今天已經簽到過了喔！")

        # 計算連續簽到
        delta = (today - last_date).days
        user["streak"] = user["streak"] + 1 if delta == 1 else 1
        
        # 更新資料
        user["total_days"] += 1
        user["last_checkin"] = today.isoformat()
        points = random.randint(5, 15)
        user["points"] += points
        user["title"] = get_title(user["total_days"], user["streak"])

        self.data[user_id] = user
        save_user_data(self.data)

        await ctx.send(
            f"✅ {ctx.author.mention} 簽到成功！\n"
            f"📅 累計天數: {user['total_days']} 天\n"
            f"🔥 連續簽到: {user['streak']} 天\n"
            f"🏆 稱號: {user['title']}\n"
            f"💰 獲得 {points} 點 (總點數: {user['points']})"
        )

    async def _first_checkin(self, ctx, user_id, today):
        """處理首次簽到邏輯"""
        points = random.randint(10, 20)  # 首次簽到獎勵加倍
        self.data[user_id] = {
            "last_checkin": today.isoformat(),
            "streak": 1,
            "total_days": 1,
            "points": points,
            "title": "入門者"
        }
        save_user_data(self.data)
        await ctx.send(
            f"🎉 {ctx.author.mention} 首次簽到成功！\n"
            f"💰 獲得新人獎勵 {points} 點！"
        )

    @commands.command(name="排行榜")
    async def leaderboard(self, ctx, 類型: str = "total"):
        """顯示簽到排行榜 (total/streak)"""
        if 類型 not in ("total", "streak"):
            return await ctx.send("請輸入有效類型: `total` (總天數) 或 `streak` (連續簽到)")

        key = "total_days" if 類型 == "total" else "streak"
        sorted_users = sorted(
            self.data.items(),
            key=lambda x: x[1].get(key, 0),
            reverse=True
        )

        embed = discord.Embed(
            title=f"📊 {'總簽到' if key == 'total_days' else '連續簽到'}排行榜",
            color=0x00ff00
        )
        
        for i, (user_id, data) in enumerate(sorted_users[:10], 1):
            try:
                user = await self.bot.fetch_user(int(user_id))
                embed.add_field(
                    name=f"{i}. {user.display_name}",
                    value=f"{data[key]} 天 | {data.get('title', '無稱號')} | {data.get('points', 0)} 點",
                    inline=False
                )
            except:
                continue

        await ctx.send(embed=embed)

async def setup(bot):
    await bot.add_cog(CheckIn(bot))