import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import Link from 'umi/link';
import {
  Row,
  Col,
  Form,
  Input,
  Modal,
  Icon,
  message,
  Button,
  DatePicker,
  Avatar,
  Divider,
  Card,
} from 'antd';
import StandardTable from '@/components/StandardTable1';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import styles from './index.less';
import { formatRangeDate } from '@/utils/utils';
import Authorized from '@/components/Authorized/Authorized';

const FormItem = Form.Item;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

/* eslint react/no-multi-comp:0 */
@connect(({ admin, loading }) => ({
  admin,
  loading: loading.models.admin,
}))
@Form.create()
class List extends PureComponent {
  state = {
    expandForm: false,
    selectedRows: [],
    formValues: {},
  };

  columns = [
    {
      title: '用户名',
      dataIndex: 'username',
    },
    {
      title: '姓名',
      dataIndex: 'name',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
    },
    {
      title: '手机号',
      dataIndex: 'mobile',
    },
    {
      title: '部门',
      dataIndex: 'department',
    },
    {
      title: '头像',
      dataIndex: 'avatar',
      render: text => <Avatar src={text} />,
    },
    {
      title: '创建时间',
      dataIndex: 'createdDate',
      sorter: true,
      render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '操作',
      render: (text, record) => (
        <Fragment>
          <Authorized authority={['admin:admin:edit']}>
            <Link to={`/admin/edit/${record.id}`}>修改</Link>
          </Authorized>
          <Divider type="vertical" />
          <Authorized authority={['admin:admin:delete']}>
            <a onClick={e => this.remove(e, record)}>删除</a>
          </Authorized>
        </Fragment>
      ),
    },
  ];

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'admin/list',
    });
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      pageNumber: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      params.orderProperty = sorter.field;
      params.orderDirection = sorter.order === 'ascend' ? 'asc' : 'desc';
    }

    dispatch({
      type: 'admin/list',
      payload: params,
    });
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'admin/list',
      payload: {},
    });
  };

  toggleForm = () => {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleSearch = e => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const { beginDate = '', endDate = '' } = formatRangeDate(fieldsValue.rangeDate);
      const values = {
        ...fieldsValue,
        beginDate,
        endDate,
      };
      delete values.rangeDate;
      this.setState({
        formValues: values,
      });

      dispatch({
        type: 'admin/list',
        payload: values,
      });
    });
  };

  remove = (e, record) => {
    const root = this;
    const { selectedRows } = this.state;
    const ids = record.id || selectedRows.map(item => item.id).join(',');

    if (!ids) {
      message.error('请选择需要删除的数据');
      return;
    }

    e.preventDefault();
    const { dispatch } = root.props;
    Modal.confirm({
      title: '警告',
      content: '确定删除该条记录?',
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: () => {
        dispatch({
          type: 'admin/remove',
          payload: {
            ids,
          },
          callback: response => {
            if (response.type === 'success') {
              message.success(response.content);
              root.componentDidMount();
            } else {
              message.error(response.content);
            }
          },
        });
      },
    });
  };

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={12} sm={24}>
            <FormItem label="注册时间">
              {getFieldDecorator('rangeDate')(<DatePicker.RangePicker />)}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="用户名">{getFieldDecorator('username')(<Input />)}</FormItem>
          </Col>
          <Col md={6} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                重置
              </Button>
              <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
                展开 <Icon type="down" />
              </a>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  renderAdvancedForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={12} sm={24}>
            <FormItem label="注册时间">
              {getFieldDecorator('rangeDate')(<DatePicker.RangePicker />)}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="用户名">{getFieldDecorator('username')(<Input />)}</FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="姓名">{getFieldDecorator('name')(<Input />)}</FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={12} sm={24}>
            <FormItem label="邮箱">{getFieldDecorator('email')(<Input />)}</FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="手机号">{getFieldDecorator('status3')(<Input />)}</FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="部门">{getFieldDecorator('department')(<Input />)}</FormItem>
          </Col>
        </Row>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ marginBottom: 24 }}>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
              重置
            </Button>
            <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
              收起 <Icon type="up" />
            </a>
          </div>
        </div>
      </Form>
    );
  }

  renderForm() {
    const { expandForm } = this.state;
    return expandForm ? this.renderAdvancedForm() : this.renderSimpleForm();
  }

  render() {
    const {
      admin: { data },
      loading,
    } = this.props;
    const { selectedRows } = this.state;

    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <div className={styles.tableListOperator}>
              <Authorized authority={['admin:admin:add']}>
                <Link to="/admin/add">
                  <Button icon="plus" type="primary">
                    添加
                  </Button>
                </Link>
              </Authorized>
              <Authorized authority={['admin:admin:delete']}>
                <Button
                  onClick={e => this.remove(e, {})}
                  icon="delete"
                  type="danger"
                  disabled={selectedRows.length === 0}
                >
                  删除
                </Button>
              </Authorized>
            </div>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              data={data}
              bordered
              size="small"
              columns={this.columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default List;
