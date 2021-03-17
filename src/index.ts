import Vue from 'vue'
import AwesomeCommentWidget from './AwesomeComment.vue'
import CommentingModel from './model/CommentingModel'
import CommentModel from './model/CommentModel'
import MissingNecessaryFieldError from './exception/MissingNecessaryFieldError'
import IsServerSideError from './exception/IsServerSideError'
import ServerSideException from './exception/ServerSideException'
import AwesomeCommentOptions from './model/AwesomeCommentOptions'
import { useDefault } from './utils/Utils'
import defaultOptions from './DefaultOptions'
const $ = require('jquery')
const cookies = require('brownies')
const uaparser = require('ua-parser-js');

export default class AwesomeComment
{
    opt: AwesomeCommentOptions

    index: any|Vue // Vue组件实例
    editor: any|Vue // Vue组件实例
    
    constructor(config: AwesomeCommentOptions)
    {
        if (!config)
            throw new MissingNecessaryFieldError('setting-parameter-object')
        
        if (!config.elementId)
            throw new MissingNecessaryFieldError('elementId')

	    this.opt = useDefault(config, defaultOptions)
        this.opt.elementId = config.elementId
    }

    async create(config?: AwesomeCommentOptions)
    {
        if(typeof(config) == 'object')
            this.opt = useDefault(config, this.opt)

        this.index = new AwesomeCommentWidget({
            el: '#'+this.opt.elementId,
            propsData: {
                owner: this
            }
        })
        // this.index.owner = this

        this.editor = this.lookupVueComponent('comment-editor')

        for (let component of this.lookupVueComponents('paginator'))
            component.owner = this

        this.loadCookies()
        
        await this.refresh()

        await this.smilies()
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

    checkServerSide(): void
    {
        if (typeof document === 'undefined')
        {
            throw new IsServerSideError()
        }
    }

    loadCookies()
    {
        if (cookies.cookies.va_nick)
            this.editor.formData.nick = cookies.cookies.va_nick
        else if (cookies.cookies.ac_nick)
            this.editor.formData.nick = cookies.cookies.ac_nick

        if (cookies.cookies.va_mail)
            this.editor.formData.mail = cookies.cookies.va_mail
        else if (cookies.cookies.ac_mail)
            this.editor.formData.mail = cookies.cookies.ac_mail

        if (cookies.cookies.va_website)
            this.editor.formData.website = cookies.cookies.va_website
        else if (cookies.cookies.ac_website)
            this.editor.formData.website = cookies.cookies.ac_website
    }

    storageCookies()
    {
        cookies.cookies.ac_nick = this.editor.formData.nick
        cookies.cookies.ac_mail = this.editor.formData.mail
        cookies.cookies.ac_website = this.editor.formData.website
    }

    async fetch2(input: RequestInfo, init?: RequestInit): Promise<any>
    {
        if(typeof(init)=='undefined')
            init = {}
            
        let defaultOptions = {
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'include',
        } as any

        // 加载默认参数
        let _init = init as any
        for (const obj in defaultOptions)
            if(!_init[obj])
                _init[obj] = defaultOptions[obj]


        let response = await fetch(input, init)

        if (response.headers.has('X-Extra-Message')) 
        {
            let em = response.headers.get('X-Extra-Message');
            let str = Buffer.from(em, 'base64').toString()
            throw new ServerSideException(str)
        }

        let raw = await response.text()

        try {
            return JSON.parse(raw)
        } catch (e) {
            if(e instanceof SyntaxError)
                return raw
            return null;
        }
    }

    // 获取评论
    async refresh()
    {
        // 打开加载动画s
        this.index.isLoading = true

        let url = `${this.opt.api}/comment?key=${this.opt.key}&pagination=${this.index.pagination_current}&label=${this.opt.pageLabel}`

        try {
            let json = await this.fetch2(url, {
                method: 'GET'
            })

            let sortfun = function(obj1: any, obj2: any) {
                if(obj1.time > obj2.time) return 1
                if(obj1.time < obj2.time) return -1
                return 0
            }
    
            let parseData = function(comments: any[])
            {
                let allcomments = [] as Array<CommentModel>
    
                for (let comment of comments)
                {
                    allcomments.push({
                        id: comment.id,
                        avatar: comment.avatar,
                        nick: comment.nick,
                        website: comment.website,
                        isauthor: comment.isauthor,
                        authorlabel: comment.authorlabel,
                        ua: uaparser(comment.useragent),
                        time: comment.time,
                        content: comment.content,
                        replies: parseData(comment.replies.slice(0).sort(sortfun))
                    } )
                }
    
                return allcomments
            }
    
            // 加载(并显示)评论数据
            this.index.allComments = parseData(json.comments) as CommentModel[]
    
            // 加载分页数据
            this.index.pagination_total = json.pages
    
            // 设置评论数量
            this.index.commentCount = json.count
        } catch(e) {
            if(e.name == 'ServerSideException')
            {
                this.editor.showAlert('评论获取失败<br/>原因：'+e.message)
            } else if(e.name == 'TypeError' && e.message == 'Failed to fetch') {
                this.editor.showAlert('评论获取失败<br/>原因：网络连接失败或者协议问题无法与服务端通信<br/>'+e.message)
            } else {
                this.editor.showAlert('评论获取失败<br/>原因：发生了未知错误<br/>'+e.message)
            }
            
            this.index.isLoading = false

            throw e
        }

        // 隐藏加载动画
        this.index.isLoading = false
    }

    // 提交评论
    async submit(comment: CommentingModel)
    {
        comment.parent = this.index.replyId
        comment.key = this.opt.key
        comment.label = this.opt.pageLabel

        let url = this.opt.api+'/comment'

        try {
            await this.fetch2(url, {
                method: 'POST',
                body: JSON.stringify(comment),
            })

            this.editor.formData.content = ''
            this.editor.$emit('cancel-reply')
            this.storageCookies()
            this.editor.refreshCaptcha() // 刷新验证码
            await this.refresh() // 刷新评论
        } catch(e) {
            if(e.name == 'ServerSideException')
            {
                this.editor.showAlert('评论获取失败<br/>原因：'+e.message)
            } else if(e.name == 'TypeError' && e.message == 'Failed to fetch') {
                this.editor.showAlert('评论获取失败<br/>原因：网络连接失败或者协议问题无法与服务端通信<br/>'+e.message)
            } else {
                this.editor.showAlert('评论获取失败<br/>原因：发生了未知错误<br/>'+e.message)
            }

            throw e
        }
    }

    // 获取表情
    async smilies()
    {
        let url = this.opt.api+'/smilie_api'

        try {
                
            let res = await this.fetch2(url, {
                method: 'GET'
            })

            let allSmilieSets = res[1]
            for (let sm of allSmilieSets) {
                let smilieSet = sm[0]
                this.editor.smiliesComponet.smilies[smilieSet] = {}

                let url2 = this.opt.api+'/smilie_api/'+smilieSet
                
                let res2 = await this.fetch2(url2, {
                    method: 'GET'
                })

                let urlHeader = res2[0]
                let allSmilies = res2[1]
                for (let sm2 of allSmilies) {
                    let smiliesName = sm2;
                    this.editor.smiliesComponet.smilies[smilieSet][smiliesName] = urlHeader+smilieSet+'/'+smiliesName
                    this.editor.smiliesComponet.$forceUpdate()
                    this.editor.smiliesComponet.defaultSmilieSet()
                }
            }

        } catch(e) {
            if(e.name == 'ServerSideException')
            {
                this.editor.showAlert('评论获取失败<br/>原因：'+e.message)
            } else if(e.name == 'TypeError' && e.message == 'Failed to fetch') {
                this.editor.showAlert('评论获取失败<br/>原因：网络连接失败或者协议问题无法与服务端通信<br/>'+e.message)
            } else {
                this.editor.showAlert('评论获取失败<br/>原因：发生了未知错误<br/>'+e.message)
            }

            throw e
        }
    }

    getCaptchaAPI()
    {
        return this.opt.api+'/captcha?_=' + (new Date().getTime())
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

// 暴露到全局变量
window.AwesomeComment = AwesomeComment