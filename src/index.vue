<template>
    <div id="va-comment">
        <div class="va-default-wrapper">
            <va-editor-widget 
                v-bind:owner="owner"
                v-bind:is-replying="isReplying"
                v-on:cancel-reply="onCancelReply"
                v-bind="$attrs"
            ></va-editor-widget>
        </div>

        <div class="va-comment-count"><span v-html="getCommentCount()"></span></div>
        
        <div class="va-all-comments">
            <va-comment 
                v-for="comment in allComments"
                v-bind:comment="comment" 
                v-bind:is-replying="isReplying"
                v-bind:smaller-avatar="false"
                v-on:reply="onClickReply"
            ></va-comment>
        </div>

        <div class="va-loading-indicator" v-show="isLoading">
            正在加载
        </div>

        <va-paginator></va-paginator>
    </div>
</template>

<style>
    :root {
        --va-text: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Lato, Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif;
        --va-monospace: Consolas, 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
    }

    body {
        color: #555;
    }

    #va-comment-widget {
        padding: 2rem 3rem;
    }

    .va-text {
        /* color: #555; */
        font-family: var(--va-text);
        font-size: .875em;
        font-weight: 500;
        /* margin-right: .875em; */
        text-decoration: none;
        display: inline-block;
    }

    .va-comment-count {
        padding: 5px;
        font-weight: 600;
        font-size: 1.25em;
        text-align: center;
        margin-bottom: 1rem;
    }

    .va-common-button {
        transition-duration: .4s;
        text-align: center;
        color: #555;
        border: 1px solid #ededed;
        border-radius: .3em;
        display: inline-block;
        background: transparent;
        vertical-align: middle;
        touch-action: manipulation;
        cursor: pointer;
        white-space: nowrap;
        padding: .5em 1.25em;
        font-size: .875em;
        line-height: 1.42857143;
        user-select: none;
        outline: none;
        box-sizing: border-box;
    }
    .va-common-button:hover {
        background-color: yellowgreen;
    }
    .va-common-button:focus {
        outline: none;
    }

    .va-markdown img{
        max-width: 300px;
    }

    .va-loading-indicator {
        text-align: center;
    }
    .va-loading-indicator:before {
        box-sizing: border-box;
        content: "";
        display: inline-block;
        width: 30px;
        height: 30px;
        border: 3px solid #a0a0a0;
        border-top-color: transparent;
        border-bottom-color: transparent;
        border-radius: 50%;
        animation: spin 2s infinite linear;
    }

    .va-all-comments {
        padding: 0.5rem;
    }

    @keyframes spin
    {
        from { transform: rotate(0deg); }
        to { transform: rotate(1turn); }
    }
</style>

<script lang="ts">
import Vue from 'vue'
import CommentModel from './commentModel'
import comments from './widget/comments.vue'
import editor from './widget/editor.vue'
import paginator from './widget/paginator.vue'
import Valine from '.'

export default Vue.extend({
    name: 'comment-widget',
    inheritAttrs: false,
    data: () => {
        return {
            owner: null,
            allComments: [],
            commentCount: 0,
            isReplying: false,
            isLoading: false,
            replyId: -1
        }
    },
    methods: {
        onClickReply: function(e) {
            this.isReplying = true

            console.log('reply button')

            let cid = $(e.target).attr('comment-id')
            let edit = $('.va-editor-widget')
            let corespondingWrapper = $('.va-comment-container[comment-id="'+cid+'"]>.va-comment-reply-wrapper')
            edit.appendTo(corespondingWrapper)
            $('.va-cancel-reply').css('display', '')

            let object = $('.va-comment-container[comment-id="'+cid+'"] .va-nick').text()
            let input = $('#va-comment-editor')
            input.attr('placeholder', '@ '+object+',')
            input.focus()

            this.replyId = cid
        },
        onCancelReply: function() {
            this.isReplying = false

            console.log('cancel reply button')

            let edit = $('.va-editor-widget')
            let defaultWrapper = $('.va-default-wrapper')
            $('.va-cancel-reply').css('display', 'none')
            edit.appendTo(defaultWrapper)

            $('#va-comment-editor').attr('placeholder', $('#va-comment-editor').attr('default-placeholder'))

            this.replyId = -1
        },
        getCommentCount: function()
        {
            if (this.commentCount > 0)
            {
                return this.commentCount+' 评论'
            } else {
                return ''
            }
        }
    },
    components: {
        'va-comment': comments,
        'va-editor-widget': editor,
        'va-paginator': paginator
    }
})
</script>