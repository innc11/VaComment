import Vue from 'vue'
import { MissingNecessaryFieldError, ServerSideError } from "./exception"
import indexvue from './vaComment.vue'
import { CreateElement } from 'vue/types/umd'
import CommentingModel from './model/commentingModel'
const $ = require('jquery')
const cookies = require('brownies')
const uaparser = require('ua-parser-js');

export default class VaComment
{
    api = 'http://127.0.0.1:600'
    key: string
    pageLabel: string
    elementId: 'va-comment-widget'
    language: any
    mailEnabled = true
    websiteEnabled = true
    captchaEnabled = true

    index: any // Vue组件实例
    editor: any // Vue组件实例
    
    constructor(config: any)
    {
        if (!config)
            throw new MissingNecessaryFieldError('setting-parameter-object')
        
        this.key =         config.key || location.pathname
        this.api =         config.api || this.api
        this.elementId =   config.elementId || this.elementId
        this.pageLabel =   config.pageLabel || document.querySelector('title').innerText
        this.language =    config.language || this.language

        this.mailEnabled =    config.mailEnabled!=null? config.mailEnabled:this.mailEnabled
        this.websiteEnabled = config.websiteEnabled!=null? config.websiteEnabled:this.websiteEnabled
        this.captchaEnabled = config.captchaEnabled!=null? config.captchaEnabled:this.captchaEnabled
    }

    create()
    {
        this.index = new Vue({
            el: '#'+this.elementId,
            render: (e: CreateElement) => e(indexvue)
        }).$children[0]

        this.editor = this.lookupVueComponent('va-editor-widget')

        this.index.owner = this
        this.index.mailEnabled = this.mailEnabled
        this.index.websiteEnabled = this.websiteEnabled
        this.index.captchaEnabled = this.captchaEnabled

        for (let component of this.lookupVueComponents('va-paginator'))
            component.owner = this

        this.loadLanguage()

        this.loadCookies()
        
        this.refresh()

        this.smilies()
    }

    destroy()
    {
        this.editor.$destroy()
        this.index.$destroy()
        this.editor = null
        this.index = null
    }

    isDestroyed()
    {
        return this.index == null
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

    loadLanguage()
    {
        if(!this.language)
            return
        
        if (this.language.comment)
            this.editor.editorPlaceholder = this.language.comment

        if (this.language.nick)
            this.editor.nickPlaceholder = this.language.nick

        if (this.language.mail)
            this.editor.mailPlaceholder = this.language.mail

        if (this.language.website)
            this.editor.websitePlaceholder = this.language.website
    
    }

    checkServerSide(): void
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

        let url = `${this.api}/comment?key=${this.key}&pagination=${this.index.pagination_current}&label=${this.pageLabel}`

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
    submit(comment: CommentingModel)
    {
        comment.parent = this.index.replyId
        comment.key = this.key
        comment.label = this.pageLabel

        let URL = this.api+'/comment'
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
            url: this.api+'/smilie_api',   async:  true,    
            cache: false,  dataType: "json",  type:  'GET',
            xhrFields: { withCredentials: true }, // 必须带上cookie
            success: (res: any) => {
                let allSmilieSets = res[1]
                for (let sm of allSmilieSets) {
                    let smilieSet = sm[0]
                    this.editor.smiliesComponet.smilies[smilieSet] = {}

                    let url2 = this.api+'/smilie_api/'+smilieSet
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
        return this.api+'/captcha?_=' + (new Date().getTime())
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