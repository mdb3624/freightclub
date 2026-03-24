package com.freightclub.service;

import com.freightclub.domain.Load;
import com.freightclub.domain.LoadDocument;
import com.freightclub.domain.User;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class BolGeneratorService {

    private static final DateTimeFormatter DT_FMT = DateTimeFormatter.ofPattern("MM/dd/yyyy HH:mm");
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MM/dd/yyyy");

    private static final float LEFT = 50f;
    private static final float WIDTH = 512f;
    private static final float RIGHT_COL = LEFT + 262f;

    public byte[] generateBol(Load load, User shipper) {
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.LETTER);
            doc.addPage(page);

            PDType1Font bold   = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            PDType1Font normal = new PDType1Font(Standard14Fonts.FontName.HELVETICA);

            float[] y = {720f};

            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                cs.setLineWidth(0.5f);

                // ── Title ──
                txt(cs, bold, 20f, LEFT, y[0], "BILL OF LADING");
                y[0] -= 22f;

                txt(cs, normal, 9f, LEFT,      y[0], "Load Ref: " + load.getId().substring(0, 8).toUpperCase());
                txt(cs, normal, 9f, RIGHT_COL, y[0], "Date: " + LocalDate.now().format(DATE_FMT));
                y[0] -= 8f;
                hline(cs, y[0]);
                y[0] -= 16f;

                // ── Origin / Destination ──
                txt(cs, bold, 8f, LEFT,      y[0], "ORIGIN / SHIPPER");
                txt(cs, bold, 8f, RIGHT_COL, y[0], "DESTINATION");
                y[0] -= 13f;

                String shipperName = nonempty(shipper.getBusinessName(),
                        shipper.getFirstName() + " " + shipper.getLastName());
                txt(cs, bold, 9f, LEFT, y[0], shipperName);
                y[0] -= 11f;

                txt(cs, normal, 9f, LEFT,      y[0], nonempty(load.getOriginAddress1(), ""));
                txt(cs, normal, 9f, RIGHT_COL, y[0], nonempty(load.getDestinationAddress1(), ""));
                y[0] -= 11f;

                String oa2 = load.getOriginAddress2();
                String da2 = load.getDestinationAddress2();
                if ((oa2 != null && !oa2.isBlank()) || (da2 != null && !da2.isBlank())) {
                    txt(cs, normal, 9f, LEFT,      y[0], nonempty(oa2, ""));
                    txt(cs, normal, 9f, RIGHT_COL, y[0], nonempty(da2, ""));
                    y[0] -= 11f;
                }

                txt(cs, normal, 9f, LEFT,
                        y[0], load.getOriginCity() + ", " + load.getOriginState() + " " + load.getOriginZip());
                txt(cs, normal, 9f, RIGHT_COL,
                        y[0], load.getDestinationCity() + ", " + load.getDestinationState() + " " + load.getDestinationZip());
                y[0] -= 11f;

                if (shipper.getPhone() != null && !shipper.getPhone().isBlank()) {
                    txt(cs, normal, 9f, LEFT, y[0], "Phone: " + shipper.getPhone());
                    y[0] -= 11f;
                }
                y[0] -= 5f;
                hline(cs, y[0]);
                y[0] -= 16f;

                // ── Freight ──
                txt(cs, bold, 8f, LEFT, y[0], "FREIGHT DESCRIPTION");
                y[0] -= 13f;

                lv(cs, normal, bold, LEFT, y[0], "Commodity:", load.getCommodity());
                y[0] -= 11f;
                lv(cs, normal, bold, LEFT, y[0], "Weight:", load.getWeightLbs() + " lbs");
                y[0] -= 11f;

                if (load.getLengthFt() != null && load.getWidthFt() != null && load.getHeightFt() != null) {
                    lv(cs, normal, bold, LEFT, y[0], "Dimensions:",
                            load.getLengthFt() + " × " + load.getWidthFt() + " × " + load.getHeightFt() + " ft");
                    y[0] -= 11f;
                }

                lv(cs, normal, bold, LEFT, y[0], "Equipment:",
                        load.getEquipmentType().name().replace("_", " "));
                y[0] -= 11f;
                y[0] -= 5f;
                hline(cs, y[0]);
                y[0] -= 16f;

                // ── Schedule ──
                txt(cs, bold, 8f, LEFT, y[0], "SCHEDULE");
                y[0] -= 13f;
                lv(cs, normal, bold, LEFT, y[0], "Pickup window:",
                        fmt(load.getPickupFrom()) + "  –  " + fmt(load.getPickupTo()));
                y[0] -= 11f;
                lv(cs, normal, bold, LEFT, y[0], "Delivery window:",
                        fmt(load.getDeliveryFrom()) + "  –  " + fmt(load.getDeliveryTo()));
                y[0] -= 11f;
                y[0] -= 5f;

                // ── Special Requirements ──
                String sr = load.getSpecialRequirements();
                if (sr != null && !sr.isBlank()) {
                    hline(cs, y[0]);
                    y[0] -= 16f;
                    txt(cs, bold, 8f, LEFT, y[0], "SPECIAL REQUIREMENTS");
                    y[0] -= 13f;
                    for (String line : wrap(sr, 90)) {
                        txt(cs, normal, 9f, LEFT, y[0], line);
                        y[0] -= 11f;
                    }
                    y[0] -= 5f;
                }

                hline(cs, y[0]);
                y[0] -= 16f;

                // ── Payment ──
                txt(cs, bold, 8f, LEFT, y[0], "PAYMENT");
                y[0] -= 13f;
                lv(cs, normal, bold, LEFT, y[0], "Pay rate:",
                        "$" + load.getPayRate() + " / " + load.getPayRateType().name().replace("_", " "));
                if (load.getPaymentTerms() != null) {
                    txt(cs, normal, 9f, RIGHT_COL, y[0],
                            "Terms: " + load.getPaymentTerms().name().replace("_", " "));
                }
                y[0] -= 11f;
                y[0] -= 5f;
                hline(cs, y[0]);
                y[0] -= 22f;

                // ── Signatures ──
                txt(cs, bold, 8f, LEFT, y[0], "SIGNATURES");
                y[0] -= 20f;
                sigLine(cs, normal, LEFT, y[0], "Shipper:");
                y[0] -= 26f;
                sigLine(cs, normal, LEFT, y[0], "Carrier / Driver:");
                y[0] -= 26f;
                sigLine(cs, normal, LEFT, y[0], "Receiver:");

                // Footer
                txt(cs, normal, 7f, LEFT, 30f,
                        "Generated by FreightClub  |  This document is for freight transport purposes only.");
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            doc.save(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate BOL PDF", e);
        }
    }

    public byte[] generateExport(Load load, User shipper, User trucker, List<LoadDocument> documents) {
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.LETTER);
            doc.addPage(page);

            PDType1Font bold   = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            PDType1Font normal = new PDType1Font(Standard14Fonts.FontName.HELVETICA);

            float[] y = {720f};

            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                cs.setLineWidth(0.5f);

                txt(cs, bold, 18f, LEFT, y[0], "LOAD EXPORT");
                y[0] -= 14f;
                txt(cs, normal, 9f, LEFT, y[0],
                        "Ref: " + load.getId().substring(0, 8).toUpperCase()
                        + "   Status: " + load.getStatus().name()
                        + "   Exported: " + LocalDate.now().format(DATE_FMT));
                y[0] -= 8f;
                hline(cs, y[0]);
                y[0] -= 16f;

                // Route
                txt(cs, bold, 8f, LEFT, y[0], "ROUTE");
                y[0] -= 13f;
                txt(cs, normal, 9f, LEFT,      y[0], "From: " + load.getOriginCity() + ", " + load.getOriginState());
                txt(cs, normal, 9f, RIGHT_COL, y[0], "To: " + load.getDestinationCity() + ", " + load.getDestinationState());
                y[0] -= 11f;
                if (load.getDistanceMiles() != null) {
                    lv(cs, normal, bold, LEFT, y[0], "Distance:", load.getDistanceMiles() + " miles");
                    y[0] -= 11f;
                }
                y[0] -= 5f;
                hline(cs, y[0]);
                y[0] -= 16f;

                // Parties
                txt(cs, bold, 8f, LEFT, y[0], "PARTIES");
                y[0] -= 13f;
                if (shipper != null) {
                    lv(cs, bold, normal, LEFT, y[0], "Shipper:",
                            nonempty(shipper.getBusinessName(), shipper.getFirstName() + " " + shipper.getLastName()));
                    y[0] -= 11f;
                }
                if (trucker != null) {
                    lv(cs, bold, normal, LEFT, y[0], "Trucker:",
                            trucker.getFirstName() + " " + trucker.getLastName());
                    if (trucker.getPhone() != null) {
                        txt(cs, normal, 9f, RIGHT_COL, y[0], trucker.getPhone());
                    }
                    y[0] -= 11f;
                }
                y[0] -= 5f;
                hline(cs, y[0]);
                y[0] -= 16f;

                // Freight
                txt(cs, bold, 8f, LEFT, y[0], "FREIGHT");
                y[0] -= 13f;
                lv(cs, normal, bold, LEFT, y[0], "Commodity:", load.getCommodity());
                y[0] -= 11f;
                lv(cs, normal, bold, LEFT, y[0], "Weight:", load.getWeightLbs() + " lbs");
                y[0] -= 11f;
                lv(cs, normal, bold, LEFT, y[0], "Equipment:", load.getEquipmentType().name().replace("_", " "));
                y[0] -= 11f;
                lv(cs, normal, bold, LEFT, y[0], "Pay rate:",
                        "$" + load.getPayRate() + " / " + load.getPayRateType().name());
                y[0] -= 11f;
                y[0] -= 5f;
                hline(cs, y[0]);
                y[0] -= 16f;

                // Documents
                txt(cs, bold, 8f, LEFT, y[0], "ATTACHED DOCUMENTS");
                y[0] -= 13f;
                if (documents.isEmpty()) {
                    txt(cs, normal, 9f, LEFT, y[0], "No documents attached.");
                    y[0] -= 11f;
                } else {
                    for (LoadDocument d : documents) {
                        String label = d.getDocumentType().name().replace("_", " ");
                        txt(cs, normal, 9f, LEFT, y[0],
                                "\u2022 " + label + " \u2014 " + d.getOriginalFilename()
                                + " (" + fmtBytes(d.getFileSizeBytes()) + ")");
                        y[0] -= 11f;
                        if (d.getNote() != null && !d.getNote().isBlank()) {
                            txt(cs, normal, 8f, LEFT + 12, y[0], "Note: " + d.getNote());
                            y[0] -= 10f;
                        }
                    }
                }

                txt(cs, normal, 7f, LEFT, 30f,
                        "Generated by FreightClub  |  Load ID: " + load.getId());
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            doc.save(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate export PDF", e);
        }
    }

    // ── Private helpers ──

    private static void txt(PDPageContentStream cs, PDType1Font font, float size,
                             float x, float y, String text) throws IOException {
        if (text == null || text.isBlank()) return;
        cs.beginText();
        cs.setFont(font, size);
        cs.newLineAtOffset(x, y);
        cs.showText(text);
        cs.endText();
    }

    private static void hline(PDPageContentStream cs, float y) throws IOException {
        cs.moveTo(LEFT, y);
        cs.lineTo(LEFT + WIDTH, y);
        cs.stroke();
    }

    private static void lv(PDPageContentStream cs, PDType1Font labelFont, PDType1Font valueFont,
                            float x, float y, String label, String value) throws IOException {
        txt(cs, labelFont, 9f, x,       y, label);
        txt(cs, valueFont, 9f, x + 100, y, value);
    }

    private static void sigLine(PDPageContentStream cs, PDType1Font font,
                                 float x, float y, String label) throws IOException {
        txt(cs, font, 9f, x, y, label);
        cs.moveTo(x + 110, y - 2);
        cs.lineTo(x + 330, y - 2);
        cs.stroke();
        txt(cs, font, 9f, x + 340, y, "Date: __________");
    }

    private static String nonempty(String primary, String fallback) {
        return (primary != null && !primary.isBlank()) ? primary : noNull(fallback);
    }

    private static String noNull(String s) {
        return s != null ? s : "";
    }

    private static String fmt(LocalDateTime dt) {
        return dt != null ? dt.format(DT_FMT) : "—";
    }

    private static String fmtBytes(long bytes) {
        if (bytes <= 0)        return "0 B";
        if (bytes < 1024)      return bytes + " B";
        if (bytes < 1_048_576) return (bytes / 1024) + " KB";
        return String.format("%.1f MB", bytes / 1_048_576.0);
    }

    private static String[] wrap(String text, int maxChars) {
        if (text.length() <= maxChars) return new String[]{text};
        List<String> lines = new ArrayList<>();
        while (text.length() > maxChars) {
            int cut = text.lastIndexOf(' ', maxChars);
            if (cut <= 0) cut = maxChars;
            lines.add(text.substring(0, cut));
            text = text.substring(cut).stripLeading();
        }
        if (!text.isEmpty()) lines.add(text);
        return lines.toArray(String[]::new);
    }
}
