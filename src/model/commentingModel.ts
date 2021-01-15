
export default interface CommentingModel
{
    key?: string,
    comment?: string
    nick: string,
    mail: string,
    website: string,
    content: string,
    parent?: number,
    captcha: string,
}