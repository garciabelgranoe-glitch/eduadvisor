import { Global, Module } from "@nestjs/common";
import { ProductEventsService } from "./product-events.service";

@Global()
@Module({
  providers: [ProductEventsService],
  exports: [ProductEventsService]
})
export class ProductEventsModule {}
