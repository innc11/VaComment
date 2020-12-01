
export default interface CommentModel
{
    id: number
    avatar: string
    nick: string
    website: string
    browser: string
    os: string
    time: number
    content: string
    replies: Array<CommentModel>
}