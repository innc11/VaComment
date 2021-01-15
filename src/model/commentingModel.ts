
export default interface CommentingModel
{
    key?: string,
    label?: string
    nick: string,
    mail: string,
    website: string,
    content: string,
    parent?: number,
    captcha: string,
}