<template>
    <div class="va-comment">
        <div class="va-comment-1" v-bind:id="'va-comment-id-'+comment.id">
            <img class="va-comment-avatar" 
                v-bind:src="comment.avatar"
                v-bind:class="smallerAvatar? 'va-comment-avatar-smaller':''"
                v-bind:style="comment.website? 'cursor: pointer;':''"
                v-bind:onclick="comment.website? 'window.open(\''+comment.website+'\', \'_blank\')':''"
            >

            <div class="va-comment-container" v-bind:comment-id="comment.id">
                <div class="va-comment-info">
                    <a class="va-nick va-text" rel="nofollow" 
                        v-bind:target="comment.website? '_blank':''"
                        v-bind:href="comment.website? comment.website:'javascript:void(0)'" 
                        v-bind:class="comment.website? 'va-nick-with-link':''"
                    >{{comment.nick}}</a>

                    <span class="va-badge-author" style="margin: 0;" v-if="comment.isauthor">{{comment.authorlabel}}</span>

                    <span class="va-browser va-text">{{(comment.ua.browser.name?comment.ua.browser.name:'')+' '+(comment.ua.browser.version?comment.ua.browser.version:'')}}</span>
                    <span class="va-os va-text" v-if="false">{{comment.ua.os.name+' '+comment.ua.os.version}}</span>
                </div>

                <div class="va-comment-more-info">
                    <span class="va-time va-text">{{parseDatetime(comment.time)}}</span>
                    <span class="va-reply-button va-text"
                        v-on:click="$emit('reply', $event)"
                        v-bind:comment-id="comment.id"
                    >回复</span>
                </div>

                <div class="va-comment-content va-text va-markdown" v-html="parseMarkdown(comment.content)"></div>

                <div class="va-comment-reply-wrapper"></div>
            </div>
        </div>

        <div class="va-comment-replies">
            <comment-list
                v-for="cmt in comment.replies"
                v-bind:comment="cmt" 
                v-bind:smaller-avatar="true"
                v-bind:class="indent(cmt.nick)? 'va-comment-replies-indent':''"
                v-on:reply="$emit('reply', $event)"
            ></comment-list>
        </div>
    </div>
</template>

<style>
    .va-comment-replies-indent {
        padding-left: 66px
    }
    .va-comment-avatar.va-comment-avatar-smaller {
        width: 2.125em;
        height: 2.125em;
    }

    .va-comment {
        display: flex;
        flex-direction: column;
    }

    .va-comment-1 {
        display: flex;
        flex-direction: row;
    }

    .va-comment-avatar {
        width: 3.125em;
        height: 3.125em;
        float: left;
        border-radius: 50%;
        margin-right: .7525em;
        border: 1px solid #f5f5f5;
        padding: .125em;
    }

    .va-nick {
        transition: all 0.2s;
        cursor: unset;
        color: #1abc9c;
        font-size: 1em !important;
    }
    
    .va-nick-with-link {
        cursor: pointer;
    }
    .va-nick-with-link:hover {
        color: #d7191a;
    }

    .va-browser, 
    .va-os,
    .va-time {
        font-size: 0.75rem !important;
        color: #b3b3b3;
    }

    .va-text.va-time {
        font-size: 12px;
    }

    /* .va-comment-content *{
        font-size: 0.875rem !important;
    } */

    .va-reply-button {
        font-size: .8125em;
        color: #aa8f70;
        cursor: pointer;
        margin-left: 1rem;
        /* float: right; */
    }

    .va-reply-button:hover {
        color: #ffb35c;
    }

    .va-comment-container{
        flex-grow: 1;
    }

    .va-all-comments > div:not(.vacomments-leave-active)~.va-comment:not(:first-child) > .va-comment-1 > .va-comment-container {
        border-top: 1px solid #e5e9ef;
        padding-top: 14px;
        /* margin-top: 14px; */
    }

    .va-all-comments > div:not(.vacomments-leave-active)~.va-comment:not(:first-child) > .va-comment-1 > .va-comment-avatar {
        margin-top: 14px;
    }

    .va-comment-replies {
        /* margin-top: 10px; */
    }

    .va-badge-author {
        color: #03acca;
        background-color: #c3f3fb;
        border-radius: 8px;
        padding: 0.35em;
        text-align: center;
        vertical-align: baseline;
        white-space: nowrap;
        font-size: 66%;
        font-weight: 600;
        line-height: 1;
        display: inline-block;
        box-sizing: border-box;
    }

</style>

<script lang="ts">
import { type } from 'os';
import Vue from 'vue'
import marked2 from '../utils/markedLib'
const moment = require('moment');
require('moment/locale/zh-cn');

moment.locale('zh-cn')

export default Vue.extend({
    name: 'comment-list',
    data: () => {
        return {
            _indent: true
        }
    },
    methods: {
        // 判断评论是否需要缩进
        indent: function(subNick) {
            let hasParent = !!this.$parent.$options._parentVnode;

            if (hasParent) {
                let reg = new RegExp('vue\\-component\\-\\d+\\-', 'g')
                let parentComponentTag = this.$parent.$options._parentVnode.tag.replace(reg, '')

                if (parentComponentTag=='comment-list') // 如果父组件和本组件都是comment-list组件
                    hasParent = true
                else
                    hasParent = false
            }
            
            let parentNick = hasParent? this.$parent.comment.nick:null
            let selfNick = this.comment.nick

            if (hasParent) {
                if (parentNick == subNick) // 判断父评论和孙评论是否为同一个人
                    return false
            }

            if (hasParent && selfNick == subNick) // 自己回复自己(父评论和子评论是否为同一人)，但顶层评论无论如何都需要缩进
                return false
            
            if (hasParent) {
                if (parentNick == selfNick && selfNick != subNick) // 判断父评论和子评论是同一个人，但是孙评论又是另外一个人（这是考虑到了连续评论的情况）
                    return false
            }

            return true
        },
        parseMarkdown: function (text) {
            return marked2(text)
        },
        parseDatetime: function(timestamp: number) {
            return moment(timestamp * 1000).calendar(null, {
                sameDay: '[今天] HH:mm',
                nextDay: '[明天] HH:mm',
                nextWeek: 'dddd',
                lastDay: '[昨天] HH:mm',
                lastWeek: 'YYYY-MM-DD HH:mm',
                sameElse: 'YYYY-MM-DD HH:mm'
            })
        }
    },
    props: {
        comment: {
            type: Object, // instance of CommentModel
            required: true
        },
        smallerAvatar: {
            type: Boolean,
            required: true
        }
    }
})
</script>