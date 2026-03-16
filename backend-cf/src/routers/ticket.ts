import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTicket, deleteTicket, getEventById, getTicketById, getTicketsByEvent, getTenantForUser, updateTicket } from "../db";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";

export const ticketRouter = router({
  // Public: list tickets for an event
  listByEvent: publicProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ input }) => {
      return getTicketsByEvent(input.eventId);
    }),

  // Organizer: create ticket type
  create: protectedProcedure
    .input(
      z.object({
        eventId: z.number(),
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        price: z.number().min(0),
        quantity: z.number().min(1),
        salesStartDatetime: z.string().optional(),
        salesEndDatetime: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const tenantResult = await getTenantForUser(ctx.user.id);
      if (!tenantResult) throw new TRPCError({ code: "FORBIDDEN" });

      const event = await getEventById(input.eventId);
      if (!event || event.tenantId !== tenantResult.tenant.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const ticketId = await createTicket({
        ...input,
        tenantId: tenantResult.tenant.id,
        salesStartDatetime: input.salesStartDatetime ? new Date(input.salesStartDatetime) : undefined,
        salesEndDatetime: input.salesEndDatetime ? new Date(input.salesEndDatetime) : undefined,
      });
      return { ticketId };
    }),

  // Organizer: update ticket
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        price: z.number().min(0).optional(),
        quantity: z.number().min(1).optional(),
        isActive: z.boolean().optional(),
        salesStartDatetime: z.string().optional().nullable(),
        salesEndDatetime: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const tenantResult = await getTenantForUser(ctx.user.id);
      if (!tenantResult) throw new TRPCError({ code: "FORBIDDEN" });

      const ticket = await getTicketById(input.id);
      if (!ticket || ticket.tenantId !== tenantResult.tenant.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { id, ...updateData } = input;
      const data: Record<string, any> = { ...updateData };
      if (input.salesStartDatetime) data.salesStartDatetime = new Date(input.salesStartDatetime);
      if (input.salesEndDatetime) data.salesEndDatetime = new Date(input.salesEndDatetime);

      await updateTicket(id, data);
      return { success: true };
    }),

  // Organizer: delete ticket
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const tenantResult = await getTenantForUser(ctx.user.id);
      if (!tenantResult) throw new TRPCError({ code: "FORBIDDEN" });

      const ticket = await getTicketById(input.id);
      if (!ticket || ticket.tenantId !== tenantResult.tenant.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await deleteTicket(input.id);
      return { success: true };
    }),
});
