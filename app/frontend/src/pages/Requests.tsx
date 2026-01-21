import React, { useState } from 'react';
import { 
  Card, 
  Button, 
  Typography, 
  Row, 
  Col, 
  Input, 
  Select, 
  List, 
  Tag, 
  Space,
  Modal,
  Form,
  Upload,
  message
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  FilterOutlined,
  CameraOutlined
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const Requests: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchText, setSearchText] = useState<string>('');

  // Заглушка данных заявок
  const requests = [
    {
      id: 1,
      title: 'Ремонт холодильника LG',
      description: 'Холодильник не морозит, слышен гул. Нужна диагностика и ремонт.',
      type: 'refrigerator',
      district: 'Центральный',
      budget: 3000,
      status: 'new',
      date: '2024-01-20',
      client: 'Иван Иванов'
    },
    {
      id: 2,
      title: 'Установка стиральной машины',
      description: 'Нужна установка и подключение новой стиральной машины.',
      type: 'washing_machine',
      district: 'Ленинский',
      budget: 1500,
      status: 'in_progress',
      date: '2024-01-19',
      client: 'Мария Петрова'
    },
    {
      id: 3,
      title: 'Ремонт телевизора Samsung',
      description: 'Телевизор не включается, нет изображения.',
      type: 'tv',
      district: 'Октябрьский',
      budget: 2500,
      status: 'completed',
      date: '2024-01-18',
      client: 'Алексей Смирнов'
    }
  ];

  const showRequestDetails = (request: any) => {
    setSelectedRequest(request);
    setIsModalVisible(true);
  };

  const handleCreateRequest = () => {
    // TODO: Реализовать создание заявки
    message.success('Функционал создания заявки будет добавлен в следующем этапе');
  };

  const getStatusTag = (status: string) => {
    const colors: Record<string, string> = {
      'new': 'blue',
      'in_progress': 'orange',
      'completed': 'green',
      'cancelled': 'red'
    };
    const texts: Record<string, string> = {
      'new': 'Новая',
      'in_progress': 'В работе',
      'completed': 'Завершена',
      'cancelled': 'Отменена'
    };
    return <Tag color={colors[status]}>{texts[status]}</Tag>;
  };

  const getTypeText = (type: string) => {
    const types: Record<string, string> = {
      'washing_machine': 'Стиральная машина',
      'refrigerator': 'Холодильник',
      'oven': 'Духовой шкаф',
      'dishwasher': 'Посудомойка',
      'tv': 'Телевизор',
      'computer': 'Компьютер',
      'other': 'Другое'
    };
    return types[type] || type;
  };

  const filteredRequests = requests.filter(request => {
    if (filterType !== 'all' && request.type !== filterType) return false;
    if (searchText && !request.title.toLowerCase().includes(searchText.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ padding: '20px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={2}>Заявки на ремонт</Title>
          <Paragraph type="secondary">
            Найдите подходящую заявку или создайте свою
          </Paragraph>
        </Col>
        <Col>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            size="large"
            onClick={handleCreateRequest}
          >
            Создать заявку
          </Button>
        </Col>
      </Row>

      {/* Фильтры и поиск */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Input
              placeholder="Поиск по названию или описанию..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              placeholder="Тип техники"
              style={{ width: '100%' }}
              value={filterType}
              onChange={setFilterType}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">Все типы</Option>
              <Option value="washing_machine">Стиральные машины</Option>
              <Option value="refrigerator">Холодильники</Option>
              <Option value="tv">Телевизоры</Option>
              <Option value="computer">Компьютеры</Option>
              <Option value="other">Другое</Option>
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <Select
              placeholder="Район"
              style={{ width: '100%' }}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">Все районы</Option>
              <Option value="Центральный">Центральный</Option>
              <Option value="Ленинский">Ленинский</Option>
              <Option value="Октябрьский">Октябрьский</Option>
              <Option value="Новоалтайск">Новоалтайск</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Список заявок */}
      <List
        dataSource={filteredRequests}
        renderItem={request => (
          <List.Item>
            <Card 
              hoverable 
              style={{ width: '100%' }}
              onClick={() => showRequestDetails(request)}
            >
              <Row justify="space-between" align="middle">
                <Col xs={24} md={16}>
                  <Title level={4} style={{ marginBottom: '8px' }}>
                    {request.title}
                  </Title>
                  <Paragraph ellipsis={{ rows: 2 }}>
                    {request.description}
                  </Paragraph>
                  <Space style={{ marginTop: '12px' }}>
                    <Tag>{getTypeText(request.type)}</Tag>
                    <Tag>{request.district}</Tag>
                    {getStatusTag(request.status)}
                    {request.budget && <Tag color="green">{request.budget} ₽</Tag>}
                  </Space>
                </Col>
                <Col xs={24} md={8} style={{ textAlign: 'right' }}>
                  <Paragraph type="secondary">
                    {request.date}
                  </Paragraph>
                  <Paragraph>
                    <strong>{request.client}</strong>
                  </Paragraph>
                  <Button type="primary" style={{ marginTop: '12px' }}>
                    Откликнуться
                  </Button>
                </Col>
              </Row>
            </Card>
          </List.Item>
        )}
        locale={{ emptyText: 'Заявки не найдены' }}
      />

      {/* Модальное окно деталей заявки */}
      <Modal
        title="Детали заявки"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Закрыть
          </Button>,
          <Button key="respond" type="primary">
            Откликнуться
          </Button>
        ]}
        width={700}
      >
        {selectedRequest && (
          <div>
            <Title level={4}>{selectedRequest.title}</Title>
            <Paragraph>{selectedRequest.description}</Paragraph>
            
            <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
              <Col span={12}>
                <strong>Тип техники:</strong>
                <div>{getTypeText(selectedRequest.type)}</div>
              </Col>
              <Col span={12}>
                <strong>Район:</strong>
                <div>{selectedRequest.district}</div>
              </Col>
              <Col span={12}>
                <strong>Бюджет:</strong>
                <div>{selectedRequest.budget} ₽</div>
              </Col>
              <Col span={12}>
                <strong>Статус:</strong>
                <div>{getStatusTag(selectedRequest.status)}</div>
              </Col>
              <Col span={12}>
                <strong>Дата создания:</strong>
                <div>{selectedRequest.date}</div>
              </Col>
              <Col span={12}>
                <strong>Клиент:</strong>
                <div>{selectedRequest.client}</div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Requests;