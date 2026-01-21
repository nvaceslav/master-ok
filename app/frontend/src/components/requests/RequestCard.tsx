import React from 'react';

interface RequestCardProps {
    id: number;
    title: string;
    description: string;
    type: string;
    district: string;
    budget?: number;
    status: 'new' | 'searching' | 'in_progress' | 'completed' | 'cancelled';
    clientName: string;
    clientPhone?: string;
    createdAt: string;
}

const RequestCard: React.FC<RequestCardProps> = ({
    id,
    title,
    description,
    type,
    district,
    budget,
    status,
    clientName,
    clientPhone,
    createdAt,
}) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new': return 'status-new';
            case 'searching': return 'status-searching';
            case 'in_progress': return 'status-in-progress';
            case 'completed': return 'status-completed';
            case 'cancelled': return 'status-cancelled';
            default: return 'status-default';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'new': return 'Новая';
            case 'searching': return 'В поиске мастера';
            case 'in_progress': return 'В работе';
            case 'completed': return 'Завершена';
            case 'cancelled': return 'Отменена';
            default: return status;
        }
    };

    const getTypeText = (type: string) => {
        const types: Record<string, string> = {
            'washing_machine': 'Стиральная машина',
            'refrigerator': 'Холодильник',
            'oven': 'Духовой шкаф',
            'dishwasher': 'Посудомоечная машина',
            'tv': 'Телевизор',
            'computer': 'Компьютер/ноутбук',
            'other': 'Другое',
        };
        return types[type] || type;
    };

    return (
        <div className="request-card">
            <div className="request-card-header">
                <h3 className="request-card-title">{title}</h3>
                <span className={`request-card-status ${getStatusColor(status)}`}>
                    {getStatusText(status)}
                </span>
            </div>
            
            <div className="request-card-body">
                <p className="request-card-description">{description}</p>
                
                <div className="request-card-details">
                    <div className="request-card-detail">
                        <span className="detail-label">Тип техники:</span>
                        <span className="detail-value">{getTypeText(type)}</span>
                    </div>
                    
                    <div className="request-card-detail">
                        <span className="detail-label">Район:</span>
                        <span className="detail-value">{district}</span>
                    </div>
                    
                    <div className="request-card-detail">
                        <span className="detail-label">Бюджет:</span>
                        <span className="detail-value">{budget ? `${budget} ₽` : 'Не указан'}</span>
                    </div>
                    
                    <div className="request-card-detail">
                        <span className="detail-label">Клиент:</span>
                        <span className="detail-value">{clientName}</span>
                    </div>
                </div>
            </div>
            
            <div className="request-card-footer">
                <button className="btn btn-primary">Откликнуться</button>
                <button className="btn btn-secondary">Позвонить</button>
            </div>
        </div>
    );
};

export default RequestCard;