
export default interface CommentModel
{
    id: number
    avatar: string
    nick: string
    website: string
    isauthor: boolean
    authorlabel: string
    ua: object
    time: number
    content: string
    replies: CommentModel[]
}