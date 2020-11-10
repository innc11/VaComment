<template>
    <div class="va-comment" >
        <div class="va-comment-1">
            <img class="va-comment-avatar" 
                v-bind:src="comment.avatar"
                v-bind:class="smallerAvatar? 'va-comment-avatar-smaller':''"
            >

            <div class="va-comment-container" v-bind:comment-id="comment.id">
                <div class="va-comment-info">
                    <a class="va-nick va-text" rel="nofollow" v-bind:href="comment.website" target="_blank">{{comment.nick}}</a>
                    <span class="va-browser va-text">{{comment.browser}}</span>
                    <span class="va-os va-text">{{comment.os}}</span>
                </div>

                <div class="va-comment-more-info">
                    <span class="va-time va-text">{{comment.time}}</span>
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
                v-for="cmt in sorted()"
                v-bind:comment="cmt" 
                v-bind:is-replying="isReplying"
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
        color: #1abc9c;
    }
    .va-nick:hover {
        color: #d7191a;
    }

    .va-browser, 
    .va-os,
    .va-time {
        font-size: 0.75rem;
        color: #b3b3b3;
    }

    /* .va-comment-content *{
        font-size: 0.875rem !important;
    } */

    .va-reply-button {
        font-size: .8125em;
        color: #ef2f11;
        cursor: pointer;
        float: right;
    }

    .va-comment-container {
        flex-grow: 1;
    }

    .va-comment-replies {
        border-left: 1px dashed #00000000;
        /* border-left: 1px dashed #c2c2c280; */
    }

</style>

<script lang="ts">
import Vue from 'vue'
import CommentModel from '../commentModel'
import marked2 from '../markedLib'

export default Vue.extend({
    name: 'comment-list',
    data: () => {
        return {
            _indent: true
        }
    },
    methods: {
        sorted: function() {
            function sortfun(obj1: CommentModel, obj2: CommentModel) {
                if(!obj1.time && obj2.time)
                    return 1
                if(obj1.time && !obj2.time)
                    return -1
                return -1
            }
            
            return this.comment.replies.slice(0).sort(sortfun)
        },
        indent: function(nick) {
            let hasParent = !!this.$parent.$options._parentVnode;
            if (hasParent) {
                let reg = new RegExp('vue\\-component\\-\\d+\\-', 'g')
                let parentComponentTag = this.$parent.$options._parentVnode.tag.replace(reg, '')

                if (parentComponentTag=='comment-list') // 如果父组件和本组件都是comment-list组件
                    if (this.$parent.comment.nick == nick) // 判断一下是否为同一个人
                        return false
            }

            if (this.comment.nick == nick) // 自己回复自己
                return false

            return true
        },
        parseMarkdown: function (text) {
            return marked2(text)
        },
    },
    props: {
        comment: {
            type: Object,
            required: true
        },
        isReplying: {
            type: Boolean,
            required: true
        },
        smallerAvatar: {
            type: Boolean,
            required: true
        }
    }
})
</script>