<template>
    <div>
        <div class="awesome-comment-widget">
            <!-- 编辑框默认的位置，当回复某个评论时会被临时移动到对应的地方 -->
            <div class="ac-editor-wrapper">
                <comment-editor
                    v-bind:owner="owner"
                    v-bind:is-replying="isReplying"
                    v-bind:mail-required="owner.opt.mailRequired"
                    v-bind:website-required="owner.opt.websiteRequired"
                    v-bind:captcha-required="owner.opt.captchaRequired"
                    v-bind:editor-placeholder="owner.opt.language.editorPlaceholder"
                    v-bind:nick-placeholder="owner.opt.language.nickPlaceholder"
                    v-bind:mail-placeholder="owner.opt.language.mailPlaceholder"
                    v-bind:website-placeholder="owner.opt.language.websitePlaceholder"
                    v-on:cancel-reply="onCancelReply"
                    v-bind="$attrs"
                ></comment-editor>
            </div>

            <!-- 评论数量显示 -->
            <div class="ac-comment-count"><span v-html="getCommentCount()"></span></div>

            <!-- 头部页码条(只在非第一页时显示) -->
            <paginator 
                class="ac-paginator-head"
                key="paginator-head"
                v-bind:flip="true"
                v-show="pagination_current!=0"
                v-bind:total="pagination_total"
                v-bind:current="pagination_current"
                v-bind:barLength="owner.opt.paginatorLength"
                v-on:pagination-changed="onPaginationChanged"
                v-on:pagination-repeatedly-click="onHeadPaginationRepeatedlyClick"
            ></paginator>

            <!-- 评论列表 -->
            <transition-group name="anim-comment-list" tag="div" class="ac-all-comments">
                <comment 
                    v-for="comment in allComments"
                    v-bind:key="comment.id"
                    v-bind:comment="comment"
                    v-bind:smaller-avatar="false"
                    v-on:reply="onClickReply"
                ></comment>
            </transition-group>

            <!-- 加载动画 -->
            <div class="ac-loading-indicator" v-show="showLoadingAnimation">正在加载</div>
            
            <!-- 底部页码条 -->
            <paginator 
                class="ac-paginator-foot"
                key="paginator-foot"
                v-bind:total="pagination_total"
                v-bind:current="pagination_current"
                v-bind:barLength="owner.opt.paginatorLength"
                v-on:pagination-changed="onPaginationChanged"
                v-on:pagination-repeatedly-click="onFootPaginationRepeatedlyClick"
            ></paginator>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import CommentModel from './model/CommentModel'
import commentObject from './widget/CommentObject.vue'
import commentEditor from './widget/CommentEditor.vue'
import paginator from     './widget/Paginator2.vue'
import AwesomeComment from '.'
const $ = require('jquery')

export default Vue.extend({
    name: 'awesome-comment',
    inheritAttrs: false,
    props: {
        owner: {
            type: AwesomeComment,
            required: true
        }
    },
    data: () => ({
        // owner: null as AwesomeComment, // AwesomeComment
        allComments: [] as Array<CommentModel>, // 所有的评论
        commentCount: 0, // 所有的评论数量
        isReplying: false, // 是否正在回复评论（是否显示'取消回复'按钮）
        isLoading: false, // 是否显示加载动画
        showLoadingAnimation: false, // 是否真正地显示加载动画
        animationTimer: null, // 加载动画延迟显示计时器
        delayTime: 100, // 加载动画延迟显示的时间
        replyId: -1, // 正在被回复的评论id（和isReplying功能类似）
        pagination_total: 0, // 总页数
        pagination_current: 0, // 当前页数
    }),
    methods: {
        onClickReply: function(e) {
            this.isReplying = true

            // 将编辑框移动到被回复的评论下方
            let cid = $(e.target).attr('comment-id')
            let editor = $('.ac-comment-editor')
            let corespondingWrapper = $('#ac-comment-object-id-'+cid+' > .ac-comment-frame > .ac-comment-board > .ac-reply-wrapper')
            editor.appendTo(corespondingWrapper)
            $('.ac-cancel-reply').css('display', '')

            let object = $('#ac-comment-object-id-'+cid+' > .ac-comment-frame > .ac-comment-board > .ac-comment-info > .ac-nick').text()
            let input = $('#awesome-comment-input')
            input.attr('placeholder', '@ '+object+',')
            input.focus()

            this.replyId = cid
        },
        onCancelReply: function() {
            this.isReplying = false

            // 将编辑框移回它本来的位置
            let edit = $('.ac-comment-editor')
            let defaultWrapper = $('.ac-editor-wrapper')
            $('.ac-cancel-reply').css('display', 'none')
            edit.appendTo(defaultWrapper)

            let input = $('#awesome-comment-input')
            input.attr('placeholder', input.attr('default-placeholder'))

            this.replyId = -1
        },
        onPaginationChanged: function(num: number) {
            // 切换页时要将编辑框移回去，不然就消失了
            this.onCancelReply()
            this.pagination_current = num
        },
        onHeadPaginationRepeatedlyClick: function(num: number) {
            $('.ac-paginator-foot').focus()
        },
        onFootPaginationRepeatedlyClick: function(num: number) {
            $('.ac-paginator-head').focus()
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
        'comment': commentObject,
        'comment-editor': commentEditor,
        'paginator': paginator
    }
})
</script>

<style lang="scss">
    .awesome-comment-widget {
        transition: all 0.3s, opacity 0.1s;

        .ac-comment-count {
            padding: 5px;
            font-weight: 600;
            font-size: 1.25em;
            text-align: center;
            margin-bottom: 1rem;
        }

        .ac-all-comments {
            padding: 0.5rem;
        }

        .ac-loading-indicator {
            text-align: center;

            &:before {
                content: "";
                box-sizing: border-box;
                display: inline-block;
                width: 30px;
                height: 30px;
                border: 3px solid #a0a0a0;
                border-top-color: transparent;
                border-bottom-color: transparent;
                border-radius: 50%;
                animation: spin 2s infinite linear;
            }

            @keyframes spin
            {
                from { transform: rotate(0deg); }
                to { transform: rotate(1turn); }
            }
        }

    }
    
    

    /* vue 动画 */
    .anim-comment-list-enter-active {
        transition: transform 0.1s;
    }

    .anim-comment-list-enter, 
    .anim-comment-list-leave-to {
        opacity: 0;
        transform: translateY(-10px);
    }

    .anim-comment-list-leave-active {
        position: absolute;
    }

</style>
