import LanguageOptions from "./LanguageOptions";

export default interface AwesomeCommentOptions
{
    elementId: string
    api?: string
    key?: string
    pageLabel?: string
    language?: LanguageOptions
    paginatorLength?: number
    mailRequired?: boolean
    websiteRequired?: boolean
    captchaRequired?: boolean
}