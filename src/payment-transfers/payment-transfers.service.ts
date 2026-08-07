import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreatePaymentTransferDto } from './dto/create-payment-transfer.dto';
import { PaymentTransfersRepository } from './payment-transfers.repository';

interface TransferRow {
  id: string;
  sale_id: string;
  sale_payment_id: string | null;
  from_payment_type: string;
  to_payment_type: string;
  amount: number;
  reason: string | null;
  created_by: string | null;
  created_at: string;
}

interface SaleForTransfer {
  id: string;
  transaction_number: string;
  payment_method: string;
  total: number;
}

@Injectable()
export class PaymentTransfersService {
  constructor(
    private readonly paymentTransfersRepository: PaymentTransfersRepository,
  ) {}

  async findAll() {
    const { data: transfers, error } =
      await this.paymentTransfersRepository.findAll();

    if (error) {
      throw error;
    }

    return (transfers ?? []).map((transfer) =>
      this.buildTransferResponse(transfer),
    );
  }

  async findBySaleId(saleId: string) {
    const { data: transfers, error } =
      await this.paymentTransfersRepository.findBySaleId(saleId);

    if (error) {
      throw error;
    }

    return (transfers ?? []).map((transfer) =>
      this.buildTransferResponse(transfer),
    );
  }

  async transfer(dto: CreatePaymentTransferDto, user?: { id?: string }) {
    if (dto.fromPaymentType === dto.toPaymentType) {
      throw new BadRequestException(
        `Cannot transfer from ${dto.fromPaymentType} to ${dto.toPaymentType}`,
      );
    }

    const { data: sale, error: saleError } =
      await this.paymentTransfersRepository.findSale(dto.saleId);

    if (saleError || !sale) {
      throw new NotFoundException(`Sale with ID ${dto.saleId} not found`);
    }

    if (sale.payment_method !== dto.fromPaymentType) {
      throw new BadRequestException(
        `Sale ${sale.transaction_number} is not paid via ${dto.fromPaymentType}`,
      );
    }

    if (dto.amount > Number(sale.total)) {
      throw new BadRequestException(
        `Transfer amount (${dto.amount}) exceeds sale total (${sale.total})`,
      );
    }

    const { data: transfer, error: transferError } =
      await this.paymentTransfersRepository.createTransfer({
        sale_id: sale.id,
        sale_payment_id: dto.salePaymentId ?? null,
        from_payment_type: dto.fromPaymentType,
        to_payment_type: dto.toPaymentType,
        amount: dto.amount,
        reason: dto.reason ?? null,
        created_by: user?.id ?? null,
      });

    if (transferError) {
      throw transferError;
    }

    return this.buildTransferResponse(transfer);
  }

  private buildTransferResponse(transfer: TransferRow) {
    return {
      id: transfer.id,
      saleId: transfer.sale_id,
      salePaymentId: transfer.sale_payment_id,
      fromPaymentType: transfer.from_payment_type,
      toPaymentType: transfer.to_payment_type,
      amount: Number(transfer.amount),
      reason: transfer.reason,
      createdBy: transfer.created_by,
      createdAt: transfer.created_at,
    };
  }
}
