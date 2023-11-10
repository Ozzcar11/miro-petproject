<script setup>
import { ref } from 'vue'

let clickedCircleState = {
   id: null,
   clicked: false,
   coords: [0, 0]
}

let clicedRectState = {
   isMoving: false,
   coords: [0, 0]
}

let clickOnCirle = (e) => {
   clickedCircleState = {
      id: e.id,
      clicked: true,
      coords: [e.cx, e.cy]
   }
}

const arrowLines = ref([])
const mouseLine = ref({
   line: ''
})

const blocks = ref(null)
const circles = ref([])

const stages = ref([
   {
      id: 1,
      x1: 0,
      x2: 1920,
      y: 150,
   },
   {
      id: 2,
      x1: 0,
      x2: 1920,
      y: 300,
   },
   {
      id: 3,
      x1: 0,
      x2: 1920,
      y: 450,
   },
   {
      id: 4,
      x1: 0,
      x2: 1920,
      y: 600,
   }
])

const data = ref([
   {
      id: 1,
      width: 100,
      height: 100,
      x: 1000,
      y: 0,
      link: [],
      stage: 1
   },
   {
      id: 2,
      width: 100,
      height: 100,
      x: 500,
      y: 200,
      link: [],
      stage: 2
   }
   ,
   {
      id: 3,
      width: 100,
      height: 100,
      x: 1200,
      y: 200,
      link: [],
      stage: 2
   }
])

const setCircles = () => {
   circles.value = []
   for (let { id } of data.value) {
      const el = blocks.value.find(item => +item.dataset.id === id)
      const cx = el.x.baseVal.value + (el.width.baseVal.value / 2)
      const cy = el.y.baseVal.value + el.height.baseVal.value
      circles.value.push({ id, cx, cy })
   }
}

const findBlock = (id) => blocks.value.find(item => +item.dataset.id === id)

const drawArrows = () => {
   arrowLines.value = []
   for (let block of data.value) {
      if (block.hasOwnProperty("link")) {
         for (let blockLink of block.link) {
            const firstBlock = findBlock(block.id)
            const secondBlock = findBlock(blockLink.id)

            const startX = firstBlock.x.baseVal.value + (firstBlock.width.baseVal.value / 2)
            const startY = firstBlock.y.baseVal.value + firstBlock.height.baseVal.value

            const endX = secondBlock.x.baseVal.value + (secondBlock.width.baseVal.value / 2)
            const endY = secondBlock.y.baseVal.value
            arrowLines.value.push({
               d: `M${startX} ${startY} C ${startX} ${endY}, ${endX} ${startY} ${endX} ${endY}`,
            },)
         }
      }
   }
}

const drawArrowToMouse = (e) => {
   mouseLine.value.line = `M${clickedCircleState.coords[0]} ${clickedCircleState.coords[1]} Q ${clickedCircleState.coords[0]} ${e.clientY} ${e.clientX} ${e.clientY}`
}

const deleteMouseArrow = () => {
   mouseLine.value.line = ``
}

const uniqValue = (value, array) => {
   let isEqual = false
   for (let item of array) {
      if (value === item) isEqual = true
   }
   return isEqual
}

const addShadowLine = (id) => {
   const { link } = data.value.find(item => item.id === clickedCircleState.id)
   if (link.length === 0) {
      link.push({
         save: false,
         id
      })
   } else if (!uniqValue(id, link.map(item => item.id))) {
      link.push({
         save: false,
         id
      })
   }
}

const deleteShadowLines = () => {
   for (let i = 0; i < data.value.length; i++) {
      data.value[i].link = data.value[i].link.filter(item => item.save)
   }
}

const saveShadowLines = () => {
   for (let i = 0; i < data.value.length; i++) {
      data.value[i].link.forEach(item => {
         item.save = true
      })
   }
}

const targetNotSelfAndBlock = (e) => +e.target.dataset.id !== clickedCircleState.id && e.target.classList.value === 'block'

const mouseMove = (e) => {
   if (clicedRectState.isMoving) {
      const el = data.value.find(item => item.id === clicedRectState.id)
      const deltaX = e.clientX - clicedRectState.coords[0]
      const deltaY = e.clientY - clicedRectState.coords[1]
      clicedRectState.coords = [e.clientX, e.clientY]
      el.x = el.x + deltaX
      el.y = el.y + deltaY
      setCircles()
      drawArrows()
      deleteMouseArrow()
   }
   if (clickedCircleState.clicked) {
      if (targetNotSelfAndBlock(e)) {
         deleteMouseArrow()
         addShadowLine(+e.target.dataset.id)
         drawArrows()
      } else {
         deleteShadowLines()
         drawArrows()
         drawArrowToMouse(e)
      }
   }
}

const mouseUp = (e) => {
   clickedCircleState.clicked = false
   clicedRectState.isMoving = false
   if (targetNotSelfAndBlock(e)) {
      saveShadowLines()
   }
}

const makeVisibleRectCircle = (id) => {
   circles.value = circles.value.map(item => {
      return { ...item, visibility: id === item.id }
   })
}

const makeInvisibleRectCircle = () => {
   circles.value = circles.value.map(item => {
      return { ...item, visibility: false }
   })
}

const selectReact = (event, item) => {
   clicedRectState = {
      id: item.id,
      isMoving: true,
      coords: [event.clientX, event.clientY]
   }
   makeVisibleRectCircle(item.id)
}

onMounted(() => {
   setCircles()
   drawArrows()
})
</script>

<template>
   <svg width="100vw"
      height="100vh"
      class="svg"
      @mousemove="mouseMove"
      @mouseup="mouseUp">
      <path class="arrow"
         v-for="(item, index) in arrowLines"
         :key="index"
         :d="item.d"
         stroke="black"
         fill="transparent" />
      <path class="mouse-line"
         :d="mouseLine.line"
         fill="transparent"
         stroke="black" />
      <g v-for="stage in stages">
         <text :x="stage.x1"
            :y="stage.y"
            v-html="`Этап ${stage.id}`"></text>
         <line :key="stage.id"
            :x1="stage.x1"
            :x2="stage.x2"
            :y1="stage.y"
            :y2="stage.y"
            stroke="#A7ABB7"
            class="stages" />
      </g>
      <rect v-for="(item, index) in data"
         @mousedown="selectReact($event, item)"
         class="block"
         ref="blocks"
         :key="index"
         :x="item.x"
         :y="item.y"
         :width="item.width"
         :height="item.height"
         :data-id="item.id" />
      <circle v-for="(item, index) in circles"
         @mousedown="clickOnCirle(item)"
         :data-id="item.id"
         class="block__btn"
         :class="{ 'visibility': item.visibility }"
         :cx="item.cx"
         :cy="item.cy"
         r="6"
         fill="red"
         :key="index" />
   </svg>
</template>

<style lang="scss">
* {
   user-select: none;
}

.block {
   &:hover {
      fill: rgb(0, 107, 107);
   }

   &__btn {
      visibility: hidden;

      &.visibility {
         visibility: visible;
      }
   }
}
</style>