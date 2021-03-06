<template>
    <div class="ac-comment-object"  v-bind:id="'ac-comment-object-id-'+comment.id"
    >
        <div class="ac-comment-frame">
            <img class="ac-comment-avatar" 
                v-bind:src="comment.avatar"
                v-bind:class="smallerAvatar? 'ac-comment-avatar-smaller':''"
                v-bind:style="comment.website? 'cursor: pointer;':''"
                v-bind:onclick="comment.website? 'window.open(\''+comment.website+'\', \'_blank\')':''"
            >

            <div class="ac-comment-board">
                <div class="ac-comment-info">
                    <a class="ac-nick" rel="nofollow" 
                        v-bind:target="comment.website? '_blank':''"
                        v-bind:href="comment.website? comment.website:'javascript:void(0)'" 
                        v-bind:class="comment.website? 'ac-nick-with-link':''"
                    >{{comment.nick}}</a>

                    <span class="ac-badge-author" style="margin: 0;" v-if="comment.isauthor">{{comment.authorlabel}}</span>

                    <span class="ac-browser">{{(comment.ua.browser.name?comment.ua.browser.name:'')+' '+(comment.ua.browser.version?comment.ua.browser.version:'')}}</span>
                    <span class="ac-os" v-if="false">{{comment.ua.os.name+' '+comment.ua.os.version}}</span>
                    <br/>
                    <span class="ac-time">{{parseDatetime(comment.time)}}</span>
                    <span class="ac-reply-button"
                        v-on:click="$emit('reply', $event)"
                        v-bind:comment-id="comment.id"
                    >回复</span>
                </div>

                <div class="ac-comment-content" v-html="parseMarkdown(comment.content)"></div>

                <div class="ac-reply-wrapper" v-bind:comment-id="comment.id"></div>
            </div>
        </div>

        <div class="ac-replies">
            <comment-object
                v-for="cmt in comment.replies"
                v-bind:key="cmt.time"
                v-bind:comment="cmt" 
                v-bind:smaller-avatar="true"
                v-bind:class="indent(cmt.nick)? 'ac-replies-indent':''"
                v-on:reply="$emit('reply', $event)"
            ></comment-object>
        </div>
    </div>
</template>

<style lang="scss">
    @import "../index.scss";

    .ac-comment-object {
        display: flex;
        flex-direction: column;

        .ac-comment-frame {
            display: flex;
            flex-direction: row;

            .ac-comment-avatar {
                width: 45px;
                height: 45px;
                flex-shrink: 0;
                border-radius: 50%;
                margin-right: 12px;
                border: 1px solid #f5f5f5;
                padding: 2px;

                &.ac-comment-avatar-smaller {
                    width: 35px;
                    height: 35px;
                }
            }

            .ac-comment-board {
                flex-grow: 1;
                width: 100%;
                max-width: calc(100% - 62px);

                .ac-comment-info {
                    .ac-nick {
                        @extend %awesome-comment-text;

                        transition: all 0.2s;
                        cursor: unset;
                        color: #1abc9c;
                        font-size: 1em !important;

                        &.ac-nick-with-link {
                            cursor: pointer;

                            &:hover {
                                color: #d7191a;
                            }
                        }
                    }
                    
                    .ac-badge-author {
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

                    .ac-browser, .ac-os, .ac-time {
                        @extend %awesome-comment-text;
                        font-size: 0.75rem !important;
                        color: #b3b3b3;
                    }

                    .ac-reply-button {
                        @extend %awesome-comment-text;
                        font-size: 14px;
                        color: #aa8f70;
                        margin-left: 1rem;
                        cursor: pointer;

                        &:hover {
                            color: #ffb35c;
                        }
                    }
                }

                .ac-comment-content {
                    @extend %awesome-comment-text;
                    @extend %awesome-comment-markdown;
                    font-size: 16px;
                    word-break: break-word;
                    overflow-x: auto;
                }
            }
        }

        .ac-replies {
            .ac-replies-indent {
                padding-left: 66px
            }
        }

        
    }

    // 评论分割线
    .ac-all-comments > div:not(.anim-comment-list-leave-active)~.ac-comment-object:not(:first-child) > .ac-comment-frame > .ac-comment-board {
        border-top: 1px solid #e5e9ef;
        padding-top: 14px;
    }

    // 分割线下面的评论头像要有一些margin-top
    .ac-all-comments > div:not(.anim-comment-list-leave-active)~.ac-comment-object:not(:first-child) > .ac-comment-frame > .ac-comment-avatar {
        margin-top: 14px;
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
    name: 'comment-object',
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

                if (parentComponentTag=='comment-object') // 如果父组件和本组件都是comment-object组件
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