import React from 'react';
import { Button, Typography, Row, Col, Card } from 'antd';
import { Link } from 'react-router-dom';
import { HomeOutlined, ToolOutlined, MessageOutlined, StarOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Home: React.FC = () => {
  return (
    <div className="home-page">
      {/* Герой-секция */}
      <section className="hero-section" style={{ 
        background: 'linear-gradient(135deg, #f5f5dc 0%, #f0e6d2 100%)',
        padding: '80px 20px',
        textAlign: 'center'
      }}>
        <Title level={1} style={{ color: '#2c3e50' }}>
          МастерОК
        </Title>
        <Title level={3} style={{ color: '#34495e', fontWeight: 'normal' }}>
          Решаем бытовые проблемы вместе
        </Title>
        <Paragraph style={{ fontSize: '18px', maxWidth: '600px', margin: '30px auto' }}>
          Онлайн-платформа для быстрого ремонта бытовой техники в Барнауле и окрестностях
        </Paragraph>
        <div style={{ marginTop: '40px' }}>
          <Link to="/requests">
            <Button type="primary" size="large" style={{ marginRight: '20px' }}>
              Создать заявку
            </Button>
          </Link>
          <Link to="/auth">
            <Button size="large">
              Стать мастером
            </Button>
          </Link>
        </div>
      </section>

      {/* Как это работает */}
      <section style={{ padding: '60px 20px', backgroundColor: '#fff' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '50px' }}>
          Как это работает
        </Title>
        <Row gutter={[32, 32]} justify="center">
          <Col xs={24} sm={12} md={6}>
            <Card hoverable style={{ textAlign: 'center', height: '100%' }}>
              <HomeOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '20px' }} />
              <Title level={4}>1. Создайте заявку</Title>
              <Paragraph>Опишите проблему с техникой и загрузите фото</Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable style={{ textAlign: 'center', height: '100%' }}>
              <ToolOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '20px' }} />
              <Title level={4}>2. Выберите мастера</Title>
              <Paragraph>Просмотрите отклики мастеров с рейтингами и ценами</Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable style={{ textAlign: 'center', height: '100%' }}>
              <MessageOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '20px' }} />
              <Title level={4}>3. Обсудите детали</Title>
              <Paragraph>Свяжитесь с мастером через встроенный чат</Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable style={{ textAlign: 'center', height: '100%' }}>
              <StarOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '20px' }} />
              <Title level={4}>4. Оставьте отзыв</Title>
              <Paragraph>Оцените работу мастера после завершения ремонта</Paragraph>
            </Card>
          </Col>
        </Row>
      </section>

      {/* География работы */}
      <section style={{ padding: '60px 20px', backgroundColor: '#f8f9fa' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '30px' }}>
          Мы работаем в
        </Title>
        <div style={{ textAlign: 'center' }}>
          <Paragraph style={{ fontSize: '18px' }}>
            • Барнаул (все районы)<br />
            • Пос. Южный<br />
            • Научный городок<br />
            • Новоалтайск
          </Paragraph>
        </div>
      </section>
    </div>
  );
};

export default Home;