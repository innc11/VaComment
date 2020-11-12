
import Vue from 'vue'
import { MissingNecessaryFieldError, ServerSideError } from "./exception"
import indexvue from './index.vue'
import { CreateElement } from 'vue/types/umd'
const cookies = require('brownies')
const uadetector = require('./userAgentDetector.js')
const moment = require('moment');

export default class Valine
{
    apiUrl = 'http://127.0.0.1:600'
    title: string

    index: any // Vue实例
    editor: any // Vue实例
    paginator: any // Vue实例
    
    // title: string, id='va-comment-widget', apiUrl='http://127.0.0.1:600'
    constructor(config: any)
    {
        if (!config.title)
            throw new MissingNecessaryFieldError('title')
        this.title = config.title

        let id = 'va-comment-widget'
        
        if (config.element_id)
            id = config.element_id
        
        if (config.api_url)
            this.apiUrl = config.api_url

        // this.index = new Vue({
        //     el: '#'+id,
        //     components: {
        //         'va-comment-widget': comment
        //     },
        //     // props: {
        //     //     owner: {
        //     //         default: () => this
        //     //     }
        //     // }
        // }).$children[0]

        this.index = new Vue({
            el: '#'+id,
            render: (e: CreateElement) => e(indexvue)
        }).$children[0]

        this.editor = this.lookupVueComponent('va-editor-widget')
        this.paginator = this.lookupVueComponent('va-paginator')

        this.index.owner = this
        this.paginator.owner = this

        this.loadCookies()
        
        this.index.isLoading = true // 加载动画
        this.refresh()
    }

    lookupVueComponent(componentName: string)
    {
        for (let index in this.index.$children)
        {
            if (this.index.$children[index].$vnode.tag.replace(new RegExp('vue-component-\\d+-'), '') == componentName)
                return this.index.$children[index]
        }

        return null
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

    refresh()
    {
        this.index.isLoading = true

        fetch(this.apiUrl+'?url='+location.pathname+'&pagination='+this.paginator.current+'&title='+this.title, {
            cache: 'no-cache',
            credentials: 'include'
        })
            .then((response) => 
                response.json()
            ).then((json) => {
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
                        let ua = uadetector(comment.useragent)
    
                        allcomments.push({
                            id: comment.id,
                            avatar: comment.avatar,
                            nick: comment.nick,
                            website: comment.website,
                            isauthor: comment.isauthor,
                            browser: ua.browser+' '+ua.version,
                            os: ua.os+' '+ua.osVersion,
                            time: moment(comment.time * 1000).calendar(),
                            content: comment.content,
                            replies: parseData(comment.replies.slice(0).sort(sortfun))
                        })
                    }

                    return allcomments
                }

                // 加载(并显示)评论数据
                this.index.allComments = parseData(json.comments)

                // 加载分页数据
                this.paginator.total = json.pages

                this.index.commentCount = json.count

                // 隐藏加载动画
                this.index.isLoading = false
            }).catch((e) => {
                console.log('发生错误: '+e);
                this.index.isLoading = false
            })
    }

    submit(comment: any)
    {
        comment.parent = this.index.replyId
        comment.title = this.title
        // fetch(, {
        //     method: 'POST',
        //     body: JSON.stringify(comment),
        //     mode: 'no-cors',
        //     headers: {
        //         "Content-Type": "application/json;charset=utf-8"
        //     },
        // }).then((data)=>{
        //     console.log(data)
        // }).catch((e) => {
        //     console.log('发生错误: '+e);
        // })

        let URL = this.apiUrl+'?url='+location.pathname
        $.ajax({
            url: URL,      async:    true,    type: 'POST',
            cache: false,  dataType: "json",  data: JSON.stringify(comment),
            xhrFields: {
                withCredentials: true // 必须带上cookie
            },
            success: (res: string) => {
            },
            error: (xhr: any, status: any,error: any) => {
                if (xhr.status!=200)
                {
                    console.log('发表评论失败: ')
                    console.log(xhr)
                    this.editor.showAlert('发表评论失败<br/>原因：'+xhr.responseText+'<br>(通常是验证码不正确)')
                } else {
                    this.editor.formData.content = ''

                    if (process.env.NODE_ENV === 'production') {
                        this.editor.showAlert('已发布!')
                    }

                    this.storageCookies()
                }
                this.editor.refreshCaptcha()
            }
        })
    }

    getCaptchaAPI()
    {
        return this.apiUrl+'/captcha.php'
    }

    static version()
    {
        return 'v'+require('../package.json').version;
    }

    static isProduction()
    {
        return process.env.NODE_ENV === 'production'
    }
}

// 注册到全局变量
window.Valine = Valine