<template>
    <div id="va-comment-widget">
        <div id="va-comment">
            <!-- 编辑框默认的位置，当回复某个评论时会被临时移动到对应的地方 -->
            <div class="va-default-wrapper">
                <va-editor-widget 
                    v-bind:owner="owner"
                    v-bind:is-replying="isReplying"
                    v-bind:mail-enabled="mailEnabled"
                    v-bind:website-enabled="websiteEnabled"
                    v-bind:captcha-enabled="captchaEnabled"
                    v-on:cancel-reply="onCancelReply"
                    v-bind="$attrs"
                ></va-editor-widget>
            </div>

            <!-- 评论数量显示 -->
            <div class="va-comment-count"><span v-html="getCommentCount()"></span></div>

            <!-- 头部页码条(只在非第一页时显示) -->
            <va-paginator 
                id="va-comment-paginator-head"
                key="paginator-head"
                v-bind:flip="true"
                v-show="pagination_current!=0"
                v-bind:total="pagination_total"
                v-bind:current="pagination_current"
                v-bind:barLength="barLength"
                v-on:pagination-changed="onPaginationChanged"
                v-on:pagination-repeatedly-click="onHeadPaginationRepeatedlyClick"
            ></va-paginator>

            <!-- 评论列表 -->
            <transition-group name="vacomments" tag="div" class="va-all-comments">
                <va-comment 
                    v-for="comment in allComments"
                    v-bind:key="comment.id"
                    v-bind:comment="comment"
                    v-bind:smaller-avatar="false"
                    v-on:reply="onClickReply"
                ></va-comment>
            </transition-group>

            <!-- 加载动画 -->
            <div class="va-loading-indicator" v-show="showLoadingAnimation">正在加载</div>
            
            <!-- 底部页码条 -->
            <va-paginator 
                id="va-comment-paginator-foot"
                key="paginator-foot"
                v-bind:total="pagination_total"
                v-bind:current="pagination_current"
                v-bind:barLength="barLength"
                v-on:pagination-changed="onPaginationChanged"
                v-on:pagination-repeatedly-click="onFootPaginationRepeatedlyClick"
            ></va-paginator>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VaComment from '.'
import CommentModel from './model/commentModel'
import comments from './widget/comments.vue'
import editor from './widget/editor.vue'
import paginator from './widget/paginator.vue'
const $ = require('jquery')

export default Vue.extend({
    name: 'comment-widget',
    inheritAttrs: false,
    data: () => {
        return {
            owner: null as VaComment, // VaComment实例
            allComments: [] as Array<CommentModel>, // 所有的评论
            commentCount: 0, // 所有的评论数量
            isReplying: false, // 是否正在回复评论（是否显示'取消回复'按钮）
            isLoading: false, // 是否显示加载动画
            showLoadingAnimation: false, // 是否真正地显示加载动画
            animationTimer: null, // 加载动画延迟显示计时器
            delayTime: 1000, // 加载动画延迟显示的时间
            replyId: -1, // 正在被回复的评论id（和isReplying功能类似）
            pagination_total: 0, // 总页数
            pagination_current: 0, // 当前页数
            barLength: 3, // 翻页器的长度
            mailEnabled: true, // 启用邮箱输入框
            websiteEnabled: true, // 启用网站输入框
            captchaEnabled: true // 启用验证码
        }
    },
    methods: {
        onClickReply: function(e) {
            this.isReplying = true

            // 将编辑框移动到被回复的评论下方
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

            // 将编辑框移回它本来的位置
            let edit = $('.va-editor-widget')
            let defaultWrapper = $('.va-default-wrapper')
            $('.va-cancel-reply').css('display', 'none')
            edit.appendTo(defaultWrapper)

            $('#va-comment-editor').attr('placeholder', $('#va-comment-editor').attr('default-placeholder'))

            this.replyId = -1
        },
        onPaginationChanged: function(num: number) {
            // 切换页时要将编辑框移回去，不然就消失了
            this.onCancelReply()
            this.pagination_current = num
        },
        onHeadPaginationRepeatedlyClick: function(num: number) {
            $('#va-comment-paginator-foot').focus()
        },
        onFootPaginationRepeatedlyClick: function(num: number) {
            $('#va-comment-paginator-head').focus()
        },
        getCommentCount: function() {
            return (this.commentCount > 0)? this.commentCount+' 评论':''
        }
    },
    watch: {
        pagination_total: function (newV, oldV) {
            if (this.pagination_current > this.pagination_total)
                this.pagination_current = this.pagination_total
        },
        pagination_current: function (newV, oldV) {
            if (this.pagination_current > this.pagination_total)
                this.pagination_current = this.pagination_total

            // 切换页面时需要刷新
            if (newV != oldV)
                this.owner.refresh()
        },
        isLoading: function (newV, oldV) {
            // 计时逻辑：延时打开，瞬时关闭
            if(newV) {
                // 打开计时器
                this.animationTimer = setTimeout(() =>{
                    this.animationTimer = null
                    // 时间到了以后打开加载动画
                    this.showLoadingAnimation = true
                }, this.delayTime)
            } else {
                // 关闭计时器
                if(this.animationTimer!=null) {
                    clearTimeout(this.animationTimer)
                    this.animationTimer = null
                }
                // 立即关闭加载动画
                this.showLoadingAnimation = newV
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

<style>
    :root {
        --va-text: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Lato, Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif;
        --va-monospace: Consolas, 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
    }

    body {
        color: #555;
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
        padding: 0.3em 0.95em;
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

    /* vue 动画 */

    .vacomments-enter, 
    .vacomments-leave-to {
        opacity: 0;
        transform: translateY(-10px);
    }

    .vacomments-leave-active {
        position: absolute;
    }

    .va-comment {
        transition: all 0.3s, opacity 0.1s;
    }

</style>
