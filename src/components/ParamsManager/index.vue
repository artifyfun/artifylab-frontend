<template>
  <div class="params-manager">
    <vxe-table
      ref="tableRef"
      :border="true"
      size="mini"
      :data="paramsNodes"
      height="auto"
      :loading="state.tableLoading"
      show-overflow
      :column-config="{ resizable: true }"
      :row-config="{ isCurrent: true, isHover: true }"
      :scroll-y="{ enabled: true, gt: 0 }"
      :edit-config="{ trigger: 'manual', mode: 'row' }"
      @cell-click="focusNode"
    >
      <vxe-column v-for="item in state.columns" :key="item.field" v-bind="item">
        <template #default="{ row }">
          <template v-if="['operation'].includes(item.field)">
            <template v-if="hasEditStatus(row)">
              <a-tooltip placement="top" :title="t('save')">
                <CheckOutlined class="operation-icon" @click.stop="saveRowEvent(row)" />
              </a-tooltip>
              <a-tooltip placement="top" :title="t('cancel')">
                <CloseOutlined class="operation-icon" @click.stop="cancelRowEvent()" />
              </a-tooltip>
            </template>
            <template v-else>
              <a-tooltip placement="top" :title="t('edit')">
                <EditOutlined class="operation-icon" @click.stop="editRowEvent(row)" />
              </a-tooltip>
              <a-tooltip placement="top" :title="t('delete')">
              <DeleteOutlined class="operation-icon" @click.stop="removeParams(row)" />
            </a-tooltip>
            </template>
          </template>
          <template v-else-if="['name'].includes(item.field)">
            <div class="cell-name">
              <div class="color-block" :style="{ background: row.color }"></div>
              <a-tooltip placement="top" :title="row.name">
                <div>{{ row.name }}</div>
              </a-tooltip>
            </div>
          </template>
          <template v-else-if="['category'].includes(item.field)">
            <div>{{ row.category === 'input' ? t('input') : t('output') }}</div>
          </template>
          <template v-else-if="['title'].includes(item.field)">
            <a-tooltip placement="top" :title="row.title || row.type">
              <div>{{ row.title || row.type }}</div>
            </a-tooltip>
          </template>
          <template v-else-if="['renderComponent'].includes(item.field)">
            <a-select
              v-model:value="row.renderComponent"
              :options="options"
              size="small"
              style="width: 100%;"
            ></a-select>
          </template>
          <span v-else>{{ row[item.field] }}</span>
        </template>
      </vxe-column>
    </vxe-table>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { CheckOutlined, CloseOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { t } from '@/utils/i18n'

const props = defineProps({
  paramsNodes: {
    type: Array,
    default: () => []
  },
})

const emit = defineEmits(['postMessage'])

const tableRef = ref()

const state = reactive({
  tableLoading: false,
  columns: [
    {
      field: 'name',
      title: t('paramName'),
      showOverflow: true,
      width: 200,
    },
    {
      field: 'description',
      title: t('alias'),
      showOverflow: true,
      editRender: {
        name: 'VxeInput',
      },
    },
    {
      field: 'category',
      title: t('paramType'),
      showOverflow: true,
    },
    {
      field: 'title',
      title: t('belongingNode'),
      showOverflow: true,
    },
    {
      field: 'operation',
      title: t('operation'),
      showOverflow: false,
      width: 200,
      fixed: 'right',
    },
    {
      field: 'renderComponent',
      title: t('renderComponent'),
      showOverflow: false,
    },
  ],
})

const options = ref([
  { label: t('textarea'), value: 'textarea' },
  { label: t('switch'), value: 'switch' },
  { label: t('slider'), value: 'slider' },
  { label: t('inputNumber'), value: 'input-number' },
  { label: t('imageUploader'), value: 'image-uploader' },
  { label: t('select'), value: 'select' },
  { label: t('postImage'), value: 'post-image' },
  { label: t('text'), value: 'text' },
])

const updateParamsNodes = (nodes) => {
  const message = JSON.stringify({
    eventType: 'updateParamsNodes',
    data: nodes,
  })
  emit('postMessage', message)
}

const removeParams = (node) => {
  const nodes = props.paramsNodes.filter((item) => item !== node)
  updateParamsNodes(nodes)
}

const centerOnNode = (node) => {
  const message = JSON.stringify({
    eventType: 'centerOnNode',
    data: node,
  })
  console.log(node)
  emit('postMessage', message)
}

const hasEditStatus = (row) => {
  const $table = tableRef.value
  if ($table) {
    return $table.isEditByRow(row)
  }
}
const editRowEvent = (row) => {
  const $table = tableRef.value
  if ($table) {
    $table.setEditRow(row)
  }
}
const saveRowEvent = (row) => {
  const $table = tableRef.value
  if ($table) {
    $table.clearEdit().then(() => {
      updateParamsNodes(props.paramsNodes)
      console.log('保存成功')
    })
  }
}
const cancelRowEvent = () => {
  const $table = tableRef.value
  if ($table) {
    $table.clearEdit()
  }
}

const focusNode = ({ row }) => {
  if (!hasEditStatus(row)) {
    centerOnNode(row)
  }
}
</script>

<style scoped lang="less">
.params-manager {
  margin-top: 10px;
  .cell-name {
    display: flex;
    align-items: center;
    .color-block {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-right: 10px;
    }
  }
}
</style>
