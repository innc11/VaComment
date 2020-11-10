
import Vue from 'vue'
import { ServerSideError } from "./exception"
import indexvue from './index.vue'
import { CreateElement } from 'vue/types/umd'
const uadetector = require('./userAgentDetector.js')
const moment = require('moment');

export default class Valine
{
    apiUrl: string
    vue: any // Vue实例
    editor: any // Vue实例
    
    constructor(id='va-comment-widget', apiUrl='http://127.0.0.1:8000')
    {
        this.apiUrl = apiUrl

        // this.vue = new Vue({
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

        this.vue = new Vue({
            el: '#'+id,
            render: (e: CreateElement) => e(indexvue)
        }).$children[0]

        for (let index in this.vue.$children)
        {
            console.log(this.vue.$children[index].$vnode.tag.replace(new RegExp('vue-component-\\d+-'), ''))
            if (this.vue.$children[index].$vnode.tag.replace(new RegExp('vue-component-\\d+-'), '') == 'va-editor-widget') {
                console.log('asfffffff')
                this.editor = this.vue.$children[index]
            }
        }

        console.log(this.editor)

        this.vue.owner = this

        this.refresh()

        let cmt = {
            avatar: 'https://www.baidu.com/img/PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png',
            nick: '_nick',
            website: '-Link',
            content: 'gangangan',
            time: 154489864,
        }


        return

        this.vue.allComments.push({
            id: 56,
            avatar: cmt.avatar,
            nick: cmt.nick,
            website: cmt.website,
            browser: '_browser',
            os: '_os',
            time: cmt.time,
            content: cmt.content,
            replies: []
        })
    }

    checkIfServerSide(): void
    {
        if (typeof document === 'undefined')
        {
            throw new ServerSideError()
        }
    }

    refresh()
    {
        fetch('http://127.0.0.1:600?url='+location.pathname, {
            cache: 'no-cache'
        })
            .then((response) => 
                response.json()
            ).then((json) => {
                function sortfun(obj1: any, obj2: any) {
                    if(!obj1.time && obj2.time)
                        return 1
                    if(obj1.time && !obj2.time)
                        return -1
                    return -1
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
                            browser: ua.browser+' '+ua.version,
                            os: ua.os+' '+ua.osVersion,
                            time: moment(comment.time * 1000).calendar(),
                            content: comment.content,
                            replies: parseData(comment.replies.slice(0).sort(sortfun))
                        })
                    }

                    return allcomments
                }

                this.vue.allComments = parseData(json);
                
            }).catch((e) => {
                console.log('发生错误: '+e);
            })
    }

    submit(comment: any)
    {
        comment.parent = this.vue.replyId
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

        let URL = 'http://127.0.0.1:600?url='+location.pathname
        $.ajax({
            url: URL,      async:    true,    type: 'POST',
            cache: false,  dataType: "json",  data: JSON.stringify(comment),
            xhrFields: {
                withCredentials: true
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
                    this.editor.showAlert('已发布!')
                }
                this.editor.refreshCaptcha()
            }
        })
    }

    getCaptchaAPI()
    {
        return 'http://127.0.0.1:600/captcha.php'
    }

    static version()
    {
        return require('../package.json').version;
    }
}

// 注册到全局变量
window.Valine = Valine