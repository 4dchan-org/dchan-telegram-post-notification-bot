import { getLatestPosts } from './graphql'
import Config from './services/config'
import TelegramBot from 'node-telegram-bot-api'
import storage from 'node-persist'

const { token, channelId } = Config.telegram
if(!token) throw "No valid token. Edit config.json."

async function start() {
  await storage.init({});

  const threads: {[keyof: string] : number} = {}

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
        board,
        image,
        name,
        comment,
        from: {
          b58id: fromId
        },
        thread
      } of posts) {
        const msg = `${thread === null ? "*New thread*\n" : ""}${name} (ID: ${fromId}) @ [/${board.name}/](https://dchan.network/#/${board.id}) No.${n} [View](https://dchan.network/#/${id}):\n${image?.ipfsHash ? `https://ipfs.io/ipfs/${image.ipfsHash} (${image.name})\n` : ""}---\n${comment}`
        const result = await bot.sendMessage(channelId, msg, {
          parse_mode: "Markdown",
          ...(!!thread ? {reply_to_message_id: threads[thread.id]} : {})
        })
        if(!!thread) threads[thread.id] = result.message_id
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