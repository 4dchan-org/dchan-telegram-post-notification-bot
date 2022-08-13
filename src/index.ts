import { getLatestPosts } from './graphql'
import Config from './services/config'
import TelegramBot from 'node-telegram-bot-api'
import storage from 'node-persist'

const { token, channelId } = Config.telegram
if(!token) throw "No valid token. Edit config.json."

async function start() {
  await storage.init({});

  try {
    let lastCreatedAt = (await storage.getItem('lastCreatedAt')) || 0

    const bot = new TelegramBot(token, {polling: true});

    const refresh = async () => {
      let { posts } = await getLatestPosts()
      const [{createdAt}] = posts

      posts = posts
        .reverse()
        .filter((post: any) => parseInt(post.createdAt) > lastCreatedAt)

      for (const { 
        id,
        n,
        board: {
          name: boardName
        },
        image,
        name,
        comment,
        from: {
          b58id: fromId
        } 
      } of posts) {
        const msg = `[${name} (${fromId}) @ /${boardName}/ \>\>${n}](https://dchan.network/#/${id}):\n${image?.ipfsHash ? `🖼 https://ipfs.io/ipfs/${image.ipfsHash} (${image.name})\n` : ""}\n${comment}`
        await bot.sendMessage(channelId, msg, {
          parse_mode: "Markdown"
        })
      }

      lastCreatedAt = parseInt(createdAt)
      await storage.setItem('lastCreatedAt', lastCreatedAt)
    }

    await refresh()

    setInterval(refresh, 10_000)
  } catch(e) {
    console.error({e})
    start()
  }
}

start()