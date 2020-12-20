import Vue from 'vue'
import { MissingNecessaryFieldError, ServerSideError } from "./exception"
import indexvue from './vaComment.vue'
import { CreateElement } from 'vue/types/umd'
const $ = require('jquery')
const cookies = require('brownies')
const uaparser = require('ua-parser-js');

export default class VaComment
{
    apiUrl = 'http://127.0.0.1:600'
    title: string
    getTitleCallback: () => string

    index: any // Vue组件实例
    editor: any // Vue组件实例
    
    constructor(config: any)
    {
        if (!config)
            throw new MissingNecessaryFieldError('setting-parameter-object')
        if (!config.title)
            throw new MissingNecessaryFieldError('title')
        this.title = config.title

        let id = 'va-comment-widget'
        
        if (config.element_id)
            id = config.element_id
        
        if (config.api_url)
            this.apiUrl = config.api_url
        
        if (config.get_title_callback)
            this.getTitleCallback = config.get_title_callback
        else
            this.getTitleCallback = () => location.pathname

        this.index = new Vue({
            el: '#'+id,
            render: (e: CreateElement) => e(indexvue)
        }).$children[0]

        this.editor = this.lookupVueComponent('va-editor-widget')

        this.index.owner = this
        for (let component of this.lookupVueComponents('va-paginator'))
        {
            component.owner = this
        }

        if (config.language)
            this.loadLanguage(config.language)

        this.loadCookies()
        
        this.refresh()

        this.smilies()
    }

    lookupVueComponent(componentName: string)
    {
        let result = this.lookupVueComponents(componentName)
        return result.length>0? result[0]:null
    }

    lookupVueComponents(componentName: string)
    {
        let result = []
        for (let index in this.index.$children)
        {
            if (this.index.$children[index].$vnode.tag.replace(new RegExp('vue-component-\\d+-'), '') == componentName)
                result.push(this.index.$children[index])
        }
        return result
    }

    loadLanguage(language: any)
    {
        if (language.comment)
            this.editor.editorPlaceholder = language.comment

        if (language.nick)
            this.editor.nickPlaceholder = language.nick

        if (language.mail)
            this.editor.mailPlaceholder = language.mail

        if (language.website)
            this.editor.websitePlaceholder = language.website
    }

    checkIfServerSide(): void
    {
        if (typeof document === 'undefined')
        {
            throw new ServerSideError()
        }
    }

    loadCookies()
    {
        if (cookies.cookies.va_nick)
            this.editor.formData.nick = cookies.cookies.va_nick
        if (cookies.cookies.va_mail)
            this.editor.formData.mail = cookies.cookies.va_mail
        if (cookies.cookies.va_website)
            this.editor.formData.website = cookies.cookies.va_website
    }

    storageCookies()
    {
        cookies.cookies.va_nick = this.editor.formData.nick
        cookies.cookies.va_mail = this.editor.formData.mail
        cookies.cookies.va_website = this.editor.formData.website
    }

    // 获取评论
    refresh()
    {
        // 打开加载动画s
        this.index.isLoading = true

        let url = this.apiUrl+'/comment?url='+this.getTitleCallback()+'&pagination='+this.index.pagination_current+'&title='+this.title
        $.ajax({
            url: url,      async:    true,    type: 'GET',
            cache: false,  dataType: "json",  
            xhrFields: { withCredentials: true }, // 必须带上cookie
            success: (json: any) => {
                function sortfun(obj1: any, obj2: any) {
                    if(obj1.time > obj2.time) return 1
                    if(obj1.time < obj2.time) return -1
                    return 0
                }

                function parseData(comments: Array<any>)
                {
                    let allcomments = [] as Array<any>

                    for (let comment of comments)
                    {
                        allcomments.push({
                            id: comment.id,
                            avatar: comment.avatar,
                            nick: comment.nick,
                            website: comment.website,
                            isauthor: comment.isauthor,
                            ua: uaparser(comment.useragent),
                            time: comment.time,
                            content: comment.content,
                            replies: parseData(comment.replies.slice(0).sort(sortfun))
                        })
                    }

                    return allcomments
                }

                // 加载(并显示)评论数据
                this.index.allComments = parseData(json.comments)

                // 加载分页数据
                this.index.pagination_total = json.pages

                // 设置评论数量
                this.index.commentCount = json.count

                // 隐藏加载动画
                this.index.isLoading = false
            },
            error: (xhr: any, status: any, error: any) => {
                console.log('评论获取失败: ')
                console.log(xhr)
                this.editor.showAlert('评论获取失败<br/>原因：'+status)

                this.index.isLoading = false
            }
        })
    }

    // 提交评论
    submit(comment: any)
    {
        comment.parent = this.index.replyId
        comment.title = this.title

        let URL = this.apiUrl+'/comment?url='+this.getTitleCallback()
        $.ajax({
            url: URL,      async:    true,    type: 'POST',
            cache: false,  dataType: "json",  data: JSON.stringify(comment),
            xhrFields: { withCredentials: true }, // 必须带上cookie
            success: (res: any) => {
                this.editor.formData.content = ''
                this.editor.$emit('cancel-reply')
                this.storageCookies()
                this.editor.refreshCaptcha() // 刷新验证码
                this.refresh() // 刷新评论
            },
            error: (xhr: any, status: any,error: any) => {
                if (xhr.status!=200)
                {
                    console.log('发表评论失败: ')
                    console.log(xhr)
                    let reason = xhr.responseJSON.reason
                    this.editor.showAlert('发表评论失败<br/>原因：'+(reason? reason:xhr.responseText))
                } 
            }
        })
    }

    // 获取表情
    smilies()
    {
        $.ajax({
            url: this.apiUrl+'/smilie_api',   async:  true,    
            cache: false,  dataType: "json",  type:  'GET',
            xhrFields: { withCredentials: true }, // 必须带上cookie
            success: (res: any) => {
                let allSmilieSets = res[1]
                for (let sm of allSmilieSets) {
                    let smilieSet = sm[0]
                    this.editor.smiliesComponet.smilies[smilieSet] = {}

                    let url2 = this.apiUrl+'/smilie_api/'+smilieSet
                    // console.log(url2)
                    $.ajax({
                        url: url2,   async:  true,    
                        cache: false,  dataType: "json",  type:  'GET',
                        xhrFields: { withCredentials: true }, // 必须带上cookie
                        success: (res2: any) => {
                            let urlHeader = res2[0]
                            let allSmilies = res2[1]
                            for (let sm2 of allSmilies) {
                                let smiliesName = sm2;
                                this.editor.smiliesComponet.smilies[smilieSet][smiliesName] = urlHeader+smilieSet+'/'+smiliesName
                                this.editor.smiliesComponet.$forceUpdate()
                                this.editor.smiliesComponet.defaultSmilieSet()
                            }
                        }
                    })
                }
            },
            error: (xhr: any, status: any,error: any) => {
                    console.log('获取表情失败: ')
                    console.log(xhr)
            }
        })
    }

    getCaptchaAPI()
    {
        return this.apiUrl+'/captcha?_=' + (new Date().getTime())
    }

    static version()
    {
        return require('../package.json').version;
    }

    static isProduction()
    {
        return process.env.NODE_ENV === 'production'
    }
}

// 注册到全局变量
window.VaComment = VaComment